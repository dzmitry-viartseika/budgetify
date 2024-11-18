import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryBus } from '@nestjs/cqrs';
import { GetSubscriptionsForTodayQuery } from './queries/get-subscriptions-for-today.query';
import { TransactionsService } from '../transactions/transactions.service';
import { SubscriptionDocument, Subscription } from './schemas/subscription.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SubscriptionsCron {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionsService: TransactionsService,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>
  ) {}

  @Cron('*/10 * * * * *') // Каждые 10 секунд (для теста)
  async handleCron() {
    const subscriptions = await this.queryBus.execute(new GetSubscriptionsForTodayQuery());
    console.log('Сегодняшние подписки:', subscriptions);

    for (const subscription of subscriptions) {
      console.log('subscription', subscription);
      try {
        // 1. Инициация транзакции
        const transaction = await this.transactionsService.create(subscription.userId, {
          categories: subscription.categories,
          title: subscription.title,
          amount: subscription.amount,
          description: subscription.description,
          cardId: subscription.cardId,
          paymentDate: subscription.paymentStartDate,
          userId: subscription.userId,
        });
        console.log(`Транзакция создана: ${transaction._id}`);
        // 67350798832cb5bd2d5bf2f6 USERID
        // 673bac868037f5e5f0910c85 CARDID
        // 673bac9a8037f5e5f0910c8c PIGGYBANKID
        // 2. Обновление paymentStartDate на +1 месяц
        const newPaymentStartDate = new Date(subscription.paymentStartDate);
        newPaymentStartDate.setMonth(newPaymentStartDate.getMonth() + 1);
        console.log('newPaymentStartDate', newPaymentStartDate);
        await this.subscriptionModel.updateOne({ _id: subscription._id }, { paymentStartDate: newPaymentStartDate });

        console.log(`Обновлен paymentStartDate для подписки ${subscription._id}`);
      } catch (error) {
        console.error(`Ошибка обработки подписки ${subscription._id}:`, error);
      }
    }
  }
}
