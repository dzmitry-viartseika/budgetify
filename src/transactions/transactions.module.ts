import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schemas/transaction.schema';
import { TransactionRepository } from './transactions.repository';
import { FilesModule } from '../files/files.module';
import { Card, CardSchema } from '../cards/schemas/card.schema';
import { PiggyBank, PiggyBankSchema } from '../piggy-bank/schemas/piggy-bank.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: Card.name, schema: CardSchema },
      { name: PiggyBank.name, schema: PiggyBankSchema },
    ]),
    FilesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
  exports: [MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }]), TransactionsService],
})
export class TransactionsModule {}
