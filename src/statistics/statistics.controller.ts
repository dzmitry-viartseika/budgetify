import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AccessTokenGuard } from '../guards/access-token.guard';

@Controller('statistics')
@UseGuards(AccessTokenGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('categories')
  async getCategoryStatistics(
    @CurrentUser() user,
    @Query('paymentStartDate') startDate: string,
    @Query('paymentEndDate') endDate: string
  ) {
    const userId = user.id;
    console.log('user', user);
    return this.statisticsService.getCategoryStatistics(userId, new Date(startDate), new Date(endDate));
  }

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
