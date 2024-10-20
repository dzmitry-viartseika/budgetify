import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { request } from 'express';
import { plainToInstance } from 'class-transformer';
import { FilesService } from '../files/files.service';
import { getPresignedUrl } from '../utils/getPresignedUrl';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly fileService: FilesService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      this.logger.error(`User with email ${createUserDto.email} already exists`);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'User with this email already exists',
          path: request.url,
        },
        HttpStatus.FORBIDDEN
      );
    }

    this.logger.verbose(`Creating user with email: ${createUserDto.email}`);
    const createdUser = new this.userModel(createUserDto);

    await createdUser.save();
    this.logger.verbose(`User created with ID: ${createdUser.id}`);
    return createdUser;
  }

  async findAll(): Promise<any[]> {
    const users = await this.userModel.find().exec();
    this.logger.verbose(`fetched users: ${users}`);
    return plainToInstance(User, users, { excludeExtraneousValues: true });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    this.logger.verbose(`fetched user by userId ${id}`);
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    this.logger.verbose(`Updating user by userId= ${id} with following data ${updateUserDto}`);
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<UserDocument> {
    this.logger.verbose(`Deleting user by userId ${id}`);
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updateAvatar(userId: string, avatarFileName: string): Promise<User> {
    console.log('updateAvatar');
    const user = await this.userModel.findById(userId).exec();
    console.log('user', user);
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User with ID ${userId} not found',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const oldAvatarFileName = user.avatar;
    this.logger.verbose(`Updating avatar for user ID: ${userId}`);

    user.avatar = avatarFileName;
    await user.save();

    this.logger.verbose(`Avatar updated for user ID: ${userId}`);

    if (oldAvatarFileName) {
      console.log('oldONE');
      await this.fileService.deleteOldAvatarFromS3(oldAvatarFileName);
    }
    console.log('user', user);
    return user;
  }

  async getUserWithAvatar(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password').exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const avatarUrl = user.avatar ? await getPresignedUrl(user.avatar) : null;

    return {
      ...user.toObject(),
      avatar: avatarUrl,
    };
  }
}
