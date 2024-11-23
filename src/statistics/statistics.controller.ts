import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AccessTokenGuard } from '../guards/access-token.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(AccessTokenGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Categories for statistics fetched successfully.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to fetch categories for statistics due to invalid data.',
  })
  @ApiCreatedResponse({
    description: 'The categories for statistics have been successfully fetched.',
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
  @Get('categories')
  async getCategoryStatistics(
    @CurrentUser() user,
    @Query('paymentStartDate') startDate: string,
    @Query('paymentEndDate') endDate: string
  ) {
    const userId = user.id;
    return this.statisticsService.getCategoryStatistics(userId, new Date(startDate), new Date(endDate));
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Categories for statistics fetched successfully.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to fetch categories for statistics due to invalid data.',
  })
  @ApiCreatedResponse({
    description: 'The categories for statistics have been successfully fetched.',
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
  @Get('monthly')
  async getMonthlyStatistics(
    @CurrentUser() user,
    @Query('paymentStartDate') startDate: string,
    @Query('paymentEndDate') endDate: string
  ) {
    const userId = user.id;
    return this.statisticsService.getMonthlyStatistics(userId, new Date(startDate), new Date(endDate));
  }
}
