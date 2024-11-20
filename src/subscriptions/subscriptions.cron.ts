import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionsForTodayQuery } from './queries/get-subscriptions-for-today.query';
import { TransactionsService } from '../transactions/transactions.service';
import { SubscriptionDocument, Subscription } from './schemas/subscription.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SubscriptionsCron {
  private readonly logger = new Logger(Subscription.name);
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionsService: TransactionsService,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>
  ) {}

  @Cron('0 0 3 * * *')
  async handleCron() {
    const subscriptions = await this.queryBus.execute(new GetSubscriptionsForTodayQuery());
    this.logger.verbose(`Subscriptions list for today: ${subscriptions}`);
    for (const subscription of subscriptions) {
      this.logger.verbose(`Current subscription: ${subscription._id}`);
      try {
        const transaction = await this.transactionsService.create(subscription.userId, {
          categories: subscription.categories,
          title: subscription.title,
          amount: subscription.amount,
          description: subscription.description,
          cardId: subscription.cardId,
          paymentDate: subscription.paymentStartDate,
          userId: subscription.userId,
        });
        this.logger.verbose(`Transaction created: ${transaction._id}`);

        const newPaymentStartDate = new Date(subscription.paymentStartDate);
        newPaymentStartDate.setMonth(newPaymentStartDate.getMonth() + 1);
        await this.subscriptionModel.updateOne({ _id: subscription._id }, { paymentStartDate: newPaymentStartDate });
        this.logger.verbose(`Updated paymentStartDate for current subscription ${subscription._id}`);
      } catch (error) {
        this.logger.error(`Subscription processing error ${subscription._id}:, ${error}`);
      }
    }
  }
}
