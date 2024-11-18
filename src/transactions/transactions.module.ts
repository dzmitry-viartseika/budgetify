import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schemas/transaction.schema';
import { TransactionRepository } from './transactions.repository';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }]), FilesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
