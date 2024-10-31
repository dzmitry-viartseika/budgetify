import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { Express } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from '../types/types/jwt-token.type';
import { FilesService } from '../files/files.service';
import { FilePrefixEnum } from '../types/enums/file-prefix.enum';

/**
 * whatever the string pass in controller decorator it will be appended to
 * API URL. to call any API from this controller you need to add prefix which is
 * passed in controller decorator.
 * in our case our base URL is https://localhost:3000/v1/users
 */
@ApiTags('users')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly fileService: FilesService
  ) {}

  /**
   * Post decorator represents method of request as we have used post decorator the method
   * of this API will be post.
   * so the API URL to create User will be
   * POST https://localhost:3000/v1/users
   */
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

  /**
   * We have used GET decorator to get all the user's list so the API URL will be
   * GET https://localhost:3000/v1/users
   */
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

  /**
   * We have used GET decorator with user id to get id from token so the API URL will be
   * GET https://localhost:3000/v1/users/profile
   */
  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return await this.usersService.getUserWithAvatar(user.id);
  }

  /**
   * we have used GET decorator with id param to get id from request
   * so the API URL will be
   * GET https://localhost:3000/v1/users/:id
   */
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

  /**
   * we have used PATCH decorator with id param to get id from request
   * so the API URL will be
   * PATCH https://localhost:3000/v1/users/:id
   */
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

  /**
   * we have used DELETE decorator with id param to get id from request
   * so the API URL will be
   * DELETE https://localhost:3000/v1/users/:id
   */
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

  @Put('avatar')
  @UseGuards(AccessTokenGuard)
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
  async uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const avatarFileName = await this.fileService.uploadFile(file, FilePrefixEnum.AVATARS);

    await this.usersService.updateAvatar(user.id, avatarFileName);

    return { avatarFileName };
  }
}
