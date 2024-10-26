import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transactions.repository';
import { ITransactionsList } from './types/interfaces/ITransactionsList';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(user, transaction) {
    return this.transactionRepository.create(user, transaction);
  }

  async getById(transactionId: string, user) {
    return this.transactionRepository.getById(transactionId, user);
  }

  async findAll({ sortBy, sortOrder, page = 1, limit = 10 }): Promise<ITransactionsList> {
    return this.transactionRepository.findAll(sortBy, sortOrder, page, limit);
  }

  async update(transactionId: string, user, transaction: UpdateTransactionDto): Promise<UpdateTransactionDto> {
    return this.transactionRepository.updateByUserIdAndTransactionId(transactionId, user, transaction);
  }

  async remove(user, transaction: UpdateTransactionDto): Promise<UpdateTransactionDto> {
    const deletedCategory = await this.transactionRepository.removeByUserIdAndTransactionId(user, transaction);
    return deletedCategory;
  }
}
