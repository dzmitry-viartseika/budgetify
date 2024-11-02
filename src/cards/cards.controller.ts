import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('cards')
@UseGuards(AccessTokenGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Card created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create card due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Card has been successfully created.',
    type: CreateUserDto,
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
  @Post()
  create(@CurrentUser() user, @Body() cardData: CreateCardDto) {
    return this.cardsService.create(user, cardData);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cards fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch cards due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Cards have been successfully fetched.',
    type: CreateCardDto,
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
  @Get()
  findAll(@CurrentUser() user) {
    return this.cardsService.findAll(user);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Card fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch card due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Card have been successfully fetched.',
    type: CreateUserDto,
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
  @Get(':id')
  findOne(@CurrentUser() user, @Param('id') id: string) {
    return this.cardsService.findOne(user, id);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Card updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to update card due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Card have been successfully updated.',
    type: CreateUserDto,
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
  @Put(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() updateData) {
    return this.cardsService.update(user, id, updateData);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Card deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to delete card due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Card have been successfully deleted.',
    type: CreateUserDto,
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
  @Delete(':id')
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.cardsService.remove(user, id);
  }
}
