import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse, ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CustomHttpException } from '../utils/CustomHttpException';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private logger = new Logger(UsersService.name);
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'User successfully registered.',
    type: CreateAuthDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async signup(@Body() createUserDto: CreateAuthDto) {
    try {
      this.logger.verbose(`Create a new user with email address: "${createUserDto.email}".`);
      const user = await  this.authService.signUp(createUserDto);
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

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User successfully logged in.',
    type: CreateAuthDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials provided.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async signin(@Body() data: CreateAuthDto) {
    try {
      this.logger.verbose(`Sign in the user with email address: "${data.email}"`);
      const user = await this.authService.signIn(data);
      this.logger.log(`User logged in with ID: ${user.id}`);
      return user;
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to logged in user: ${error.message}`);
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

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User successfully logged out.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Invalid or expired access token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  logout(@Req() req: Request) {
    try {
      this.logger.verbose(`Logged out the user with email address: "${req.user['sub']}"`);
      return  this.authService.logout(req.user['sub']);
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }
      this.logger.error(`Failed to delete user: ${error.message}`);
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

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Tokens successfully refreshed.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized: Invalid or expired refresh token.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
