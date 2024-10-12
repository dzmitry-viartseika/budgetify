import {
  HttpException, HttpStatus,
  Injectable, Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { request } from 'express';
import { TokensService } from '../tokens/tokens.service';
import * as process from 'node:process';

const SALT_OF_ROUNDS = 3;

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokensService: TokensService,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    this.logger.verbose(`Creating user with email address: "${createUserDto.email}"`);

    const userExists = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (userExists) {
      this.logger.error(`User with email ${createUserDto.email} already exists`);
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: 'User already exists',
        path: request.url,
      }, HttpStatus.BAD_REQUEST);
    }

    const hash = await this.hasData(createUserDto.password);

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    this.logger.verbose(`User created with ID: ${newUser.id} and email address ${newUser.email}`);
    this.logger.verbose(`Creating user with email address: "${newUser.email}"`);


    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.tokensService.create(newUser.id, tokens.refreshToken);
    return new UserDto(newUser, tokens);
  }

  async signIn(data: LoginAuthDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid email or password',
        path: request.url,
      }, HttpStatus.UNAUTHORIZED);
    }
    this.logger.verbose(`User logging in with ID: ${user.id} and email address ${user.email}`);
    const passwordMatches = await bcrypt.compare(data.password, user.password);
    if (!passwordMatches) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Password or email is incorrect',
        path: request.url,
      }, HttpStatus.UNAUTHORIZED);
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.tokensService.update(user.id, tokens.refreshToken);
    return new UserDto(user, tokens);
  }

  async logout(userId: string) {
    this.logger.verbose(`Logging out user with ID: ${userId}`);
    await this.tokensService.delete(userId);
    this.logger.log(`Successfully logged out user with ID: ${userId}`);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    this.logger.verbose(`Refreshing tokens for user with ID: ${userId}`);

    const storedToken = await this.tokensService.findByUserId(userId);
    if (!storedToken) {
      this.logger.error(`Refresh token not found for user ID: ${userId}`);
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        message: 'Access Denied: Refresh token not found',
      }, HttpStatus.FORBIDDEN);
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, storedToken.refreshToken);
    if (!refreshTokenMatches) {
      this.logger.error(`Invalid refresh token for user ID: ${userId}`);
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        message: 'Access Denied: Invalid refresh token',
      }, HttpStatus.FORBIDDEN);
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
      }, HttpStatus.NOT_FOUND);
    }

    const tokens = await this.getTokens(userId, user.email);
    this.logger.verbose(`Generated new tokens for user ID: ${userId}`);

    await this.tokensService.update(userId, tokens.refreshToken);
    this.logger.verbose(`Updated refresh token for user ID: ${userId}`);

    return tokens;
  }

  async hasData(data: string) {
    const hash = await bcrypt.hash(data, SALT_OF_ROUNDS);
    return hash;
  }

  async getTokens(userId: string, username: string) {
    this.logger.log(`Generating tokens for user ID: ${userId}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: userId,
          username,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          userId: userId,
          username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    this.logger.log(`Tokens generated successfully for user ID: ${userId}`);

    return {
      accessToken,
      refreshToken,
    };
  }
}