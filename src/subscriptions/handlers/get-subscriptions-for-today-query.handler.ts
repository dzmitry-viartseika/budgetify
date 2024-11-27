import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../schemas/subscription.schema';
import { GetSubscriptionsForTodayQuery } from '../queries/get-subscriptions-for-today.query';

@QueryHandler(GetSubscriptionsForTodayQuery)
export class GetSubscriptionsForTodayHandler implements IQueryHandler<GetSubscriptionsForTodayQuery> {
  constructor(@InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>) {}

  async execute(): Promise<Subscription[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.subscriptionModel
      .find({
        paymentStartDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();
  }
}
