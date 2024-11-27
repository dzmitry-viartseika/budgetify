import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async getAllEmails(): Promise<string[]> {
    const users = await this.userModel.find({}, { email: 1 }).lean();
    return users.map(user => user.email);
  }
}
