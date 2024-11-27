import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { GetSubscriptionsQuery } from '../queries/get-subscriptions.query';

@QueryHandler(GetSubscriptionsQuery)
export class GetSubscriptionsHandler implements IQueryHandler<GetSubscriptionsQuery> {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async execute(
    query: GetSubscriptionsQuery
  ): Promise<{ data: Subscription[]; total: number; totalPages: number; currentPage: number }> {
    const { page, limit, search, userId } = query;

    const filter = { userId };
    if (search) {
      filter['title'] = { $regex: search, $options: 'i' };
    }

    const data = await this.subscriptionModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.subscriptionModel.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);
    const currentPage = page;

    return { data, total, totalPages, currentPage };
  }
}
