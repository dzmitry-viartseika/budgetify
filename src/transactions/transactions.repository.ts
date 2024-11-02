import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { request } from 'express';
import { FilesService } from '../files/files.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { getPresignedUrl } from '../files/utils/getPresignedUrl';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(Transaction.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly fileService: FilesService
  ) {}

  async create(user, transaction: CreateTransactionDto) {
    this.logger.verbose(`User creating transaction with data ${transaction}`);
    const createdTransaction = new this.transactionModel({
      ...transaction,
      userId: user.id,
    });

    this.logger.verbose(`User created transaction with ID ${createdTransaction._id} files successfully`);

    return createdTransaction.save();
  }

  async getById(transactionId: string, user) {
    const selectedTransaction = await this.transactionModel.findOne({ userId: user.id, _id: transactionId }).exec();

    if (!selectedTransaction) {
      this.logger.error(`Transaction with id ${selectedTransaction.id} is not exists`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Current transaction is not exists',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    if (selectedTransaction.files && selectedTransaction.files.length > 0) {
      try {
        const fileUrls = await Promise.all(
          selectedTransaction.files.map(async fileName => ({
            fileName,
            url: await getPresignedUrl(fileName),
          }))
        );
        selectedTransaction.files = fileUrls as any;
      } catch (error) {
        this.logger.error(`Error generating presigned URLs: ${error.message}`);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Could not generate presigned URLs',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    this.logger.verbose(`User fetched transaction with ID ${transactionId} successfully`);
    return selectedTransaction;
  }

  async findAll(sortBy: string, sortOrder: 'asc' | 'desc', page: number, limit: number) {
    const query = {};

    let sort: { [key: string]: 1 | -1 } = {};

    if (sortBy === 'paymentDate') {
      sort = { paymentDate: sortOrder === 'asc' ? 1 : -1 };
    }

    const total = await this.transactionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const data = await this.transactionModel
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    this.logger.verbose(`Transactions fetched successfully`);
    return { data, total, totalPages, currentPage: page };
  }

  async updateByUserIdAndTransactionId(transactionId: string, user, transaction: Partial<any>): Promise<any | null> {
    const updatedUserCategory = await this.transactionModel
      .findOneAndUpdate({ userId: user.id, _id: transactionId }, transaction, { new: true })
      .exec();
    if (!updatedUserCategory) {
      this.logger.error(`Transaction with transactionId ${transactionId} does not exists for userId ${user.id}`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Transaction with name does not exists for current userId',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }
    this.logger.verbose(`User updated transaction with following data ${updatedUserCategory} successfully`);
    return updatedUserCategory;
  }

  async removeByUserIdAndTransactionId(user, dto: any): Promise<any> {
    const draftTransaction = await this.transactionModel
      .findOneAndDelete({ _id: dto.transactionId, userId: user.id })
      .exec();
    if (!draftTransaction) {
      this.logger.error(`Transaction with id ${dto.transactionId} does not exists for userId ${user.id}`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Transaction with TransactionId ${dto.transactionId} does not exists for current userId`,
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }
    this.logger.verbose(`User deleted transaction with following data ${draftTransaction} successfully`);
    return draftTransaction;
  }
}
