import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  generateTwoFactorSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `MyApp (${email})`,
    });
    return secret;
  }

  async generateQRCode(secret: string) {
    const qrCodeDataURL = QRCode.toDataURL(secret);
    return qrCodeDataURL;
  }

  verifyTwoFactorCode(secret: string, token: string): boolean {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    return isValid;
  }
}
