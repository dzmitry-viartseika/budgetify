import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { PiggyBankService } from './piggy-bank.service';
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
import { CreatePiggyBankDto } from './dto/create-piggy-bank.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCardDto } from '../cards/dto/create-card.dto';

@ApiTags('piggy-banks')
@UseGuards(AccessTokenGuard)
@Controller('piggy-banks')
export class PiggyBankController {
  constructor(private readonly piggyBankService: PiggyBankService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Piggy bank created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create piggy bank due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Piggy bank has been successfully created.',
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
  create(@CurrentUser() user, @Body() piggyBankData: CreatePiggyBankDto) {
    return this.piggyBankService.create(user, piggyBankData);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Piggy banks fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch Piggy banks due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Piggy banks have been successfully fetched.',
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
  @Get()
  findAll(@CurrentUser() user) {
    return this.piggyBankService.findAll(user);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Piggy banksfetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch Piggy bank due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Piggy bank have been successfully fetched.',
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
  @Get(':id')
  findOne(@CurrentUser() user, @Param('id') id: string) {
    return this.piggyBankService.findOne(user, id);
  }

  @Put(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() updateData) {
    return this.piggyBankService.update(user, id, updateData);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Piggy bank deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to delete Piggy bank due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Piggy bank have been successfully deleted.',
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
  @Delete(':id')
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.piggyBankService.remove(user, id);
  }
}
