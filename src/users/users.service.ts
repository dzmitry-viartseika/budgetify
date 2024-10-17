import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { request } from 'express';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

  async findAll(): Promise<UserDocument[]> {
    const users = await this.userModel.find().exec();
    this.logger.verbose(`fetched users: ${users}`);
    return users;
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
}
