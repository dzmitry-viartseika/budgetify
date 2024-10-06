import {
  BadRequestException,
  ForbiddenException, HttpStatus,
  Injectable, Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { CustomHttpException } from '../utils/CustomHttpException';
import { LoginAuthDto } from './dto/login-auth.dto';

const SALT_OF_ROUNDS = 3;

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    this.logger.verbose(`Creating user with email address: "${createUserDto.email}"`);

    if (!createUserDto.email || !createUserDto.password) {
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'You must fill in required fields',
          details: 'There was an error while trying to create the user.',
          timestamp: new Date().toISOString(),
          path: '/auth/signup',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }

    const userExists = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (userExists) {
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'User already exists',
          details: 'There was an error while trying to create the user.',
          timestamp: new Date().toISOString(),
          path: '/auth/signup',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }

    const hash = await this.hasData(createUserDto.password);

    try {
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hash,
      });
      this.logger.verbose(`User created with ID: ${newUser.id} and email address ${newUser.email}`);
      this.logger.verbose(`Creating user with email address: "${newUser.email}"`);


      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return new UserDto(newUser, tokens);
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
          path: '/auth/signup',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }

  }

  async signIn(data: LoginAuthDto) {
    if (!data.email || !data.password) {
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'You must fill in required fields',
          details: 'There was an error while trying to create the user.',
          timestamp: new Date().toISOString(),
          path: '/auth/signin',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.UNAUTHORIZED,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: 'There was an error while trying to sign the user in.',
          timestamp: new Date().toISOString(),
          path: '/auth/signin',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.UNAUTHORIZED);
    }
    this.logger.verbose(`User logging in with ID: ${user.id} and email address ${user.email}`);
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new CustomHttpException({
        status: 'error',
        statusCode: HttpStatus.UNAUTHORIZED,
        error: {
          code: 'INVALID_PASSWORD_OR_EMAIL',
          message: 'Password or email is incorrect',
          details: 'There was an error while trying to sign the user in.',
          timestamp: new Date().toISOString(),
          path: '/auth/signin',
          suggestion: 'Please check the input data.'
        },
      }, HttpStatus.UNAUTHORIZED);
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return new UserDto(user, tokens);
  }

  async logout(userId: string) {
    this.logger.verbose(`Logging out user with ID: ${userId}`);

    try {
      await this.usersService.update(userId, { refreshToken: null } as UpdateUserDto);

      this.logger.log(`Successfully logged out user with ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to log out user with ID: ${userId}`, error.stack);

      throw new CustomHttpException(
        {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: 'LOGOUT_FAILED',
            message: 'Failed to log out the user',
            details: `An error occurred while logging out user ID: ${userId}.`,
            path: '/auth/logout',
            suggestion: 'Please try again later or contact support if the issue persists.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    this.logger.verbose(`Refreshing tokens for user with ID: ${userId}`);

    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      this.logger.error(`Refresh token not found for user ID: ${userId}`);
      throw new CustomHttpException(
        {
          status: 'error',
          statusCode: HttpStatus.FORBIDDEN,
          error: {
            code: 'REFRESH_TOKEN_NOT_FOUND',
            message: 'Access Denied: Refresh token not found',
            details: `No refresh token found for user ID: ${userId}`,
            path: '/auth/refresh',
            suggestion: 'Please try logging in again or contact support.',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      this.logger.error(`Invalid refresh token for user ID: ${userId}`);
      throw new CustomHttpException(
        {
          status: 'error',
          statusCode: HttpStatus.FORBIDDEN,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Access Denied: Invalid refresh token',
            details: 'The provided refresh token does not match our records.',
            path: '/auth/refresh',
            suggestion: 'Please log in again to obtain a new token.',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const tokens = await this.getTokens(user.id, user.email);
    this.logger.verbose(`Generated new tokens for user ID: ${userId}`);

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.verbose(`Updated refresh token for user ID: ${userId}`);

    return tokens;
  }

  async hasData(data: string) {
    const hash = await bcrypt.hash(data, SALT_OF_ROUNDS);
    return hash;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    this.logger.verbose(`Updating refresh token for user with ID: ${userId}`);

    try {
      const hashedRefreshToken = await this.hasData(refreshToken);
      this.logger.log(`Hashed refresh token for user ID: ${userId}`);

      await this.usersService.update(userId, {
        refreshToken: hashedRefreshToken,
      } as UpdateUserDto);

      this.logger.log(`Successfully updated refresh token for user ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update refresh token for user ID: ${userId}`, error.stack);

      throw new CustomHttpException(
        {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: 'REFRESH_TOKEN_UPDATE_FAILED',
            message: 'Failed to update refresh token',
            details: `An error occurred while updating the refresh token for user ID: ${userId}.`,
            path: '/auth/refresh',
            suggestion: 'Please try again later or contact support if the issue persists.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTokens(userId: string, username: string) {
    this.logger.log(`Generating tokens for user ID: ${userId}`);

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: userId,
            username,
          },
          {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
          },
        ),
        this.jwtService.signAsync(
          {
            sub: userId,
            username,
          },
          {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
          },
        ),
      ]);

      this.logger.log(`Tokens generated successfully for user ID: ${userId}`);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Failed to generate tokens for user ID: ${userId}`, error.stack);

      throw new CustomHttpException(
        {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: 'TOKEN_GENERATION_FAILED',
            message: 'Failed to generate tokens for the user.',
            details: `An error occurred while generating tokens for user ID: ${userId}.`,
            path: '/auth/tokens',
            suggestion: 'Please try again later or contact support if the issue persists.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}