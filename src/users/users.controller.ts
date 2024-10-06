import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, Logger, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomHttpException } from '../utils/CustomHttpException';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private logger = new Logger(UsersService.name);
  constructor(private readonly usersService: UsersService ) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: The email address is already taken.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      this.logger.verbose(`Creating user with email address: "${createUserDto.email}"`);
      const user = await this.usersService.create(createUserDto);
      this.logger.log(`User created with ID: ${user.id}`);
      return user;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }

      this.logger.error(`Failed to create user: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: 'Something went wrong on the server.',
          timestamp: new Date().toISOString(),
          path: '/users',
          suggestion: 'Please try again later.'
        },
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiCreatedResponse({
    type: [CreateUserDto],
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @Get()
  async findAll() {
    try {
      this.logger.verbose('Fetching all users');
      const users =  this.usersService.findAll();
      this.logger.log(`fetched all users: ${users}`);
      return users;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: 'Something went wrong on the server.',
          timestamp: new Date().toISOString(),
          path: '/users',
          suggestion: 'Please try again later.'
        },
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'User found.',
    type: CreateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid ID provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  async findById(@Param('id') id: string) {
    try {
      this.logger.verbose(`Fetching user with ID: ${id}.`);
      const user =  this.usersService.findById(id);
      this.logger.log(`fetched users by ID: ${user}`);
      return user;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch user: ${error.message} with ID ${id}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: 'Something went wrong on the server.',
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please try again later.'
        },
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'User successfully updated.',
    type: UpdateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      this.logger.verbose(`Updating user with ID: ${id}.`);
      return this.usersService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to update user: ${error.message} with ID ${id} and following data ${updateUserDto}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: 'Something went wrong on the server.',
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please try again later.'
        },
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'User successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid ID provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  remove(@Param('id') id: string) {
    try {
      this.logger.verbose(`Deleting user with ID: ${id}.`);
      return this.usersService.remove(id);
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to delete user: ${error.message} with ID ${id}`);
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          details: 'Something went wrong on the server.',
          timestamp: new Date().toISOString(),
          path: `/users/${id}`,
          suggestion: 'Please try again later.'
        },
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}