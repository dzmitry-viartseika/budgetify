import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { AccessTokenGuard } from '../guards/access-token.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('/me')
  async me(@CurrentUser() user) {
    console.log('ME', user);
    return this.profileService.me(user);
  }
}
