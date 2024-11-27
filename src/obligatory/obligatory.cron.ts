import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryBus } from '@nestjs/cqrs';
import { GetObligationsForTodayQuery } from './queries/get-obligations-for-today.query';
import { TransactionsService } from '../transactions/transactions.service';
import { ObligatoryDocument, Obligatory } from './schemas/obligatory.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ObligatoryCron {
  private readonly logger = new Logger(Obligatory.name);
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionsService: TransactionsService,
    @InjectModel(Obligatory.name) private readonly obligatoryModel: Model<ObligatoryDocument>
  ) {}

  @Cron('*/10 * * * * *')
  async handleCron() {
    const obligations = await this.queryBus.execute(new GetObligationsForTodayQuery());
    this.logger.verbose(`Obligations list for today: ${obligations}`);
    for (const obligatory of obligations) {
      this.logger.verbose(`Current obligatory: ${obligatory._id}`);
      try {
        const transaction = await this.transactionsService.create(obligatory.userId, {
          categories: [obligatory.title],
          title: obligatory.title,
          amount: obligatory.amount,
          description: obligatory.description,
          cardId: obligatory.cardId,
          paymentDate: obligatory.paymentStartDate,
          userId: obligatory.userId,
        });
        this.logger.verbose(`Transaction created: ${transaction._id}`);

        const newPaymentStartDate = new Date(obligatory.paymentStartDate);
        newPaymentStartDate.setMonth(newPaymentStartDate.getMonth() + 1);
        await this.obligatoryModel.updateOne({ _id: obligatory._id }, { paymentStartDate: newPaymentStartDate });
        this.logger.verbose(`Updated paymentStartDate for current obligatory ${obligatory._id}`);
      } catch (error) {
        this.logger.error(`Obligatory processing error ${obligatory._id}:, ${error}`);
      }
    }
  }
}
