import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { RefreshTokenGuard } from '../guards/refreshToken.guard';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ApiBadRequestResponse, ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse, ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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
    return this.authService.signUp(createUserDto);
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
    return this.authService.signIn(data);
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
    return this.authService.logout(req.user['userId']);
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
  @ApiBearerAuth()
  refreshTokens(@Req() req: Request) {
    const userId = req.user['userId'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
