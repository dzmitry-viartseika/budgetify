import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { UpdateSubscriptionCommand } from './commands/update-subscription.command';
import { DeleteSubscriptionCommand } from './commands/delete-subscription.command';
import { GetSubscriptionQuery } from './queries/get-subscription.query';
import { GetSubscriptionsQuery } from './queries/get-subscriptions.query';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('subscriptions')
@UseGuards(AccessTokenGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Subscription created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create subscription due to invalid data.' })
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
  @Post()
  async create(@CurrentUser() user, @Body() dto: CreateSubscriptionDto) {
    const { title, categories, amount, paymentStartDate, paymentEndDate, cardId, description } = dto;
    return this.commandBus.execute(
      new CreateSubscriptionCommand(
        title,
        categories,
        amount,
        paymentStartDate,
        paymentEndDate,
        description,
        user.id,
        cardId
      )
    );
  }

  @ApiOperation({ summary: 'Update an existing subscription' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscription updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found.' })
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
  @Put(':id')
  async update(@CurrentUser() user, @Param('id') id: string, @Body() dto: CreateSubscriptionDto) {
    return this.commandBus.execute(
      new UpdateSubscriptionCommand(
        id,
        dto.title,
        dto.categories,
        dto.amount,
        dto.paymentStartDate,
        dto.paymentEndDate,
        user.id,
        dto.description
      )
    );
  }

  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Subscription deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found.' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteSubscriptionCommand(user.id, id));
  }

  @ApiOperation({ summary: 'Get a single subscription by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription fetched successfully.',
    type: CreateSubscriptionDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found.' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async getOne(@CurrentUser() user, @Param('id') id: string): Promise<CreateSubscriptionDto> {
    return this.queryBus.execute(new GetSubscriptionQuery(user.id, id));
  }

  @ApiOperation({ summary: 'Get a list of all subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions fetched successfully.',
    type: [CreateSubscriptionDto],
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch subscriptions due to invalid data.' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Get()
  async getAll(
    @CurrentUser() user,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = ''
  ): Promise<CreateSubscriptionDto[]> {
    return this.queryBus.execute(new GetSubscriptionsQuery(page, limit, search, user.id));
  }
}
