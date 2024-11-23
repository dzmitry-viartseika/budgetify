import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TransactionSchema } from './types/types';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
