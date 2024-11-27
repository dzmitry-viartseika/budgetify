import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { GetSubscriptionQuery } from '../queries/get-subscription.query';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@QueryHandler(GetSubscriptionQuery)
export class GetSubscriptionHandler implements IQueryHandler<GetSubscriptionQuery> {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async execute(query: GetSubscriptionQuery): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findById(query.id).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== query.userId) {
      throw new ForbiddenException('You do not have permission to read this subscription');
    }

    return this.subscriptionModel.findById(query.id).exec();
  }
}
