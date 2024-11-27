import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { CreateSubscriptionCommand } from '../commands/create-subscription.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { request } from 'express';

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionHandler implements ICommandHandler<CreateSubscriptionCommand> {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async execute(command: CreateSubscriptionCommand): Promise<Subscription> {
    const { title, categories, amount, paymentStartDate, paymentEndDate, description, userId, cardId } = command;

    if (!userId) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'UserId is not exists',
          path: request.url,
        },
        HttpStatus.NOT_FOUND
      );
    }

    const newSubscription = await this.subscriptionModel.create({
      title,
      categories,
      amount,
      paymentStartDate,
      paymentEndDate,
      description,
      userId,
      cardId,
    });
    return newSubscription;
  }
}
