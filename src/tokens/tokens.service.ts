import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TokenDocument } from './schemas/token.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(
    @InjectModel('Token') private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService
  ) {}

  async create(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.tokenModel.create({ userId, refreshToken: hashedRefreshToken });
  }

  async update(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.tokenModel.updateOne({ userId }, { refreshToken: hashedRefreshToken }, { upsert: true });
  }

  async findByUserId(userId: string): Promise<TokenDocument | null> {
    return this.tokenModel.findOne({ userId });
  }

  async delete(userId: string): Promise<void> {
    await this.tokenModel.deleteOne({ userId });
  }

  async getTokens(id: string, email: string, role: string) {
    this.logger.log(`Generating tokens for user ID: ${id}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id, email, role },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        }
      ),
      this.jwtService.signAsync(
        { id, email, role },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        }
      ),
    ]);

    this.logger.log(`Tokens generated successfully for user ID: ${id}`);

    return {
      accessToken,
      refreshToken,
    };
  }
}
