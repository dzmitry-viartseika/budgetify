import { Body, Controller, Post, Get } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
import { TokensService } from '../tokens/tokens.service';

@ApiTags('2fa')
@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokensService: TokensService
  ) {}

  @Get('setup')
  async setup(@Body() body: { email: string }) {
    const currentUser = await this.userModel.findOne({ email: body.email }).exec();
    console.log('currentUser', currentUser);
    const secret = this.twoFactorAuthService.generateTwoFactorSecret(currentUser.email);
    currentUser.twoFactorSecret = secret.base32;
    await currentUser.save();

    const qrCode = await this.twoFactorAuthService.generateQRCode(secret.otpauth_url);
    return { qrCode, secret: secret.base32 };
  }

  @Post('verify')
  async verify(@Body() body: { token: string; email: string }) {
    const currentUser = await this.userModel.findOne({ email: body.email }).exec();
    const isValid = this.twoFactorAuthService.verifyTwoFactorCode(currentUser.twoFactorSecret, body.token.trim());
    if (isValid) {
      currentUser.isTwoFactorEnabled = true;
      await currentUser.save();
      const { accessToken, refreshToken } = await this.tokensService.getTokens(
        currentUser.id,
        currentUser.email,
        currentUser.role
      );
      return { accessToken, refreshToken, message: '2FA enabled successfully!' };
    } else {
      return { success: false, message: 'Invalid 2FA code.' };
    }
  }
}
