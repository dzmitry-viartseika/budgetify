import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { RolesEnum } from '../types/enums/roles.enum';
import { AccessTokenGuard } from '../guards/access-token.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('notifications')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Emails fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch emails due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The emails have been successfully fetched.',
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
  @ApiBearerAuth()
  @Get('emails')
  @Roles(RolesEnum.ADMIN)
  async getAllEmails() {
    return this.notificationsService.getAllEmails();
  }
}
