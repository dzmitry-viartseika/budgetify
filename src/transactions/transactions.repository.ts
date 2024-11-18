import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { request } from 'express';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { getPresignedUrl } from '../files/utils/getPresignedUrl';
import { PiggyBank, PiggyBankDocument } from '../piggy-bank/schemas/piggy-bank.schema';
import { CategoryTypeEnum } from '../types/enums/category-type.enum';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(Transaction.name);

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(PiggyBank.name) private piggyBankModel: Model<PiggyBankDocument>
  ) {}

  async create(user, transaction: CreateTransactionDto) {
    console.log('transaction.userId', transaction.userId);
    console.log('transaction.cardId', transaction.cardId);
    this.logger.verbose(`User creating transaction with data ${transaction}`);

    const piggyBank = await this.verifyUserAccessToPiggyBank(user.id || transaction.userId, transaction.cardId);

    const createdTransaction = new this.transactionModel({
      ...transaction,
      userId: user.id || transaction.userId,
    });

    await createdTransaction.save();

    await this.updatePiggyBankBalance(transaction, piggyBank);

    this.logger.verbose(`Transaction created with ID ${createdTransaction._id}`);

    return createdTransaction;
  }

  private async verifyUserAccessToPiggyBank(userId: string, cardId: string): Promise<PiggyBankDocument> {
    console.log('cardId', cardId);
    console.log('userId', userId);
    const piggyBank = await this.piggyBankModel.findOne({ cardId, userId });

    if (!piggyBank) {
      throw new ForbiddenException(`User does not have access to the PiggyBank associated with card ID ${cardId}`);
    }

    return piggyBank;
  }

  private async updatePiggyBankBalance(transaction: CreateTransactionDto, piggyBank: PiggyBankDocument) {
    const { amount, type } = transaction;

    if (type === CategoryTypeEnum.INCOME) {
      piggyBank.balance += amount;
      piggyBank.savedAmount += amount;
    } else if (type === CategoryTypeEnum.EXPENSE) {
      if (piggyBank.balance < amount) {
        throw new ForbiddenException(`Insufficient funds in PiggyBank for expense transaction`);
      }
      piggyBank.balance -= amount;
    }

    await piggyBank.save();
    this.logger.verbose(`Updated PiggyBank balance for user ID ${piggyBank.userId}`);
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
