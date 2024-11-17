import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateObligatoryCommand } from './commands/create-obligatory.command';
import { UpdateObligatoryCommand } from './commands/update-obligatory.command';
import { DeleteObligatoryCommand } from './commands/delete-obligatory.command';
import { GetObligatoryQuery } from './queries/get-obligatory.query';
import { GetObligationsQuery } from './queries/get-obligations.query';
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
import { CreateObligatoryDto } from './dto/create-obligatory.dto';

@ApiTags('obligations')
@UseGuards(AccessTokenGuard)
@Controller('obligations')
export class ObligatoryController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  @ApiOperation({ summary: 'Create a new obligatory' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Obligatory created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create obligatory due to invalid data.' })
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
  async create(@CurrentUser() user, @Body() dto: CreateObligatoryDto) {
    const { title, amount, paymentStartDate, paymentEndDate, cardId, description } = dto;
    return this.commandBus.execute(
      new CreateObligatoryCommand(title, amount, paymentStartDate, paymentEndDate, description, user.id, cardId)
    );
  }

  @ApiOperation({ summary: 'Update an existing obligatory' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Obligatory updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Obligatory not found.' })
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
  async update(@CurrentUser() user, @Param('id') id: string, @Body() dto: CreateObligatoryDto) {
    return this.commandBus.execute(
      new UpdateObligatoryCommand(
        id,
        dto.title,
        dto.amount,
        dto.paymentStartDate,
        dto.paymentEndDate,
        user.id,
        dto.description
      )
    );
  }

  @ApiOperation({ summary: 'Delete a obligatory' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Obligatory deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Obligatory not found.' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteObligatoryCommand(user.id, id));
  }

  @ApiOperation({ summary: 'Get a single obligatory by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Obligatory fetched successfully.',
    type: CreateObligatoryDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Obligatory not found.' })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async getOne(@CurrentUser() user, @Param('id') id: string): Promise<CreateObligatoryDto> {
    return this.queryBus.execute(new GetObligatoryQuery(user.id, id));
  }

  @ApiOperation({ summary: 'Get a list of all obligations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Obligations fetched successfully.',
    type: [CreateObligatoryDto],
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch obligations due to invalid data.' })
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
  ): Promise<CreateObligatoryDto[]> {
    return this.queryBus.execute(new GetObligationsQuery(page, limit, search, user.id));
  }
}
