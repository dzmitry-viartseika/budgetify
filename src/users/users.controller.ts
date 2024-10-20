import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, request } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from '../types/types/jwt-token.type';
import { FilesService } from '../files/files.service';

@ApiTags('users')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileService: FilesService
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create user due to invalid data.' })
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
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @ApiCreatedResponse({
    type: [CreateUserDto],
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Users fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch users.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: You do not have the necessary permission.' })
  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    console.log('Inside getProfile method');

    try {
      console.log('Current User:', user);

      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const fetchedUser = await this.usersService.getUserWithAvatar(user.id);
      console.log('Fetched User:', fetchedUser);

      if (!fetchedUser) {
        console.error(`User not found for ID: ${user.id}`);
        throw new NotFoundException(`User not found for ID: ${user.id}`);
      }

      return fetchedUser;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      throw new InternalServerErrorException('Could not fetch user profile');
    }
  }

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
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch user.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: You do not have the necessary permission.' })
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

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
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to update user.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: You do not have the necessary permission.' })
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

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
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to delete user.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden: You do not have the necessary permission.' })
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadAvatar(@Param('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'File is not provided',
          path: request.url,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    let avatarFileName: string;
    try {
      avatarFileName = await this.fileService.uploadFile(file);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error uploading file ${error}`,
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      await this.usersService.updateAvatar(userId, avatarFileName);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error updating avatar ${error}`,
          path: request.url,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { avatarFileName };
  }
}
