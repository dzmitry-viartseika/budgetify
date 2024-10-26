import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ITransactionsList } from './types/interfaces/ITransactionsList';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload } from '../types/types/jwt-token.type';
import { Express } from 'express';
import { FilePrefixEnum } from '../types/enums/file-prefix.enum';
import { FilesService } from '../files/files.service';

@ApiTags('transactions')
@UseGuards(AccessTokenGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionService: TransactionsService,
    private readonly fileService: FilesService
  ) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create transaction due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Transaction has been successfully created.',
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: The transaction name is already taken.',
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
  async create(@CurrentUser() user, @Body() transaction: CreateTransactionDto) {
    return this.transactionService.create(user, transaction);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch transaction due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Transaction have been successfully fetched.',
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
  @Get(':transactionId')
  async getById(@Param('transactionId') transactionId: string, @CurrentUser() user) {
    return this.transactionService.getById(transactionId, user);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transactions fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch transactions due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Transactions have been successfully fetched.',
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
  @Get()
  async getAllTransactions(@Query() query: GetTransactionsDto): Promise<ITransactionsList> {
    const { sortBy, sortOrder, page, limit } = query;
    return this.transactionService.findAll({ sortBy, sortOrder, page, limit });
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to update transaction due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Transaction have been successfully updated.',
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
  @Put(':transactionId')
  async update(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user,
    @Body() transaction: UpdateTransactionDto
  ): Promise<UpdateTransactionDto> {
    return await this.transactionService.update(transactionId, user, transaction);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Transaction deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to delete transaction due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Transaction have been successfully deleted.',
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
  @Delete(':transactionId')
  async remove(@Param('transactionId') transactionId: string, @CurrentUser() user) {
    const transaction = {
      user,
      transactionId,
    } as UpdateTransactionDto;
    return await this.transactionService.remove(user, transaction);
  }

  @Post('document')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(pdf)$/)) {
          return callback(new Error('Only PDF files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const documentFileName = await this.fileService.uploadFile(file, FilePrefixEnum.DOCUMENTS);

    return { documentFileName };
  }
}
