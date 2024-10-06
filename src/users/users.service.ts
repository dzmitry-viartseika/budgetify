import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { CustomHttpException } from '../utils/CustomHttpException';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      this.logger.error(`User with email ${createUserDto.email} already exists`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.CONFLICT,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
          details: `The user with email ${createUserDto.email} already exists in our records.`,
          timestamp: new Date().toISOString(),
          path: '/users',
          suggestion: 'Please use a different email address.'
        },
      }, HttpStatus.CONFLICT);
    }

    this.logger.verbose(`Creating user with email: ${createUserDto.email}`);
    const createdUser = new this.userModel(createUserDto);

    try {
      await createdUser.save();
      this.logger.verbose(`User created with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'USER_CREATION_FAILED',
          message: 'Failed to create user',
          details: 'There was an error while trying to create the user.',
          timestamp: new Date().toISOString(),
          path: '/users',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      const users = await this.userModel.find().exec();
      this.logger.verbose(`fetched users: ${users}`);
      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'FETCHING_ALL_USERS_FAILED',
          message: 'Failed to fetch users',
          details: 'There was an error while trying to fetch users.',
          timestamp: new Date().toISOString(),
          path: '/users',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }
  }

  async findById(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id);
      this.logger.verbose(`fetched user: ${user.email} by userId= ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'FETCHING_USER_BY_ID_FAILED',
          message: 'Failed to fetch user by id',
          details: `There was an error while trying to fetch user by userId ${id}`,
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    try {
      this.logger.verbose(`Updating user by userId= ${id} with following data=${updateUserDto}`);
      return this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: 'Failed to update user by id',
          details: `There was an error while trying to update user by userId ${id} with updatedData ${updateUserDto}`,
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string): Promise<UserDocument> {
    try {
      this.logger.verbose(`Deleting user by userId= ${id}`);
      return this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'DELETE_USER_FAILED',
          message: 'Failed to delete user by id',
          details: `There was an error while trying to delete user by userId ${id}`,
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }
  }
}