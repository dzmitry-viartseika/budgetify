import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { RolesEnum } from '../types/enums/roles.enum';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('emails')
  @Roles(RolesEnum.ADMIN)
  async getAllEmails() {
    return this.notificationsService.getAllEmails();
  }
}
