import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { TokenDocument } from './schemas/token.schema';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel('Token') private tokenModel: Model<TokenDocument>,
  ) {}

  async create(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.tokenModel.create({ userId, refreshToken: hashedRefreshToken });
  }

  async update(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.tokenModel.updateOne(
      { userId },
      { refreshToken: hashedRefreshToken },
      { upsert: true },
    );
  }

  async findByUserId(userId: string): Promise<TokenDocument | null> {
    return this.tokenModel.findOne({ userId });
  }

  async delete(userId: string): Promise<void> {
    await this.tokenModel.deleteOne({ userId });
  }
}