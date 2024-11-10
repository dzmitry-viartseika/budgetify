import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { UpdateSubscriptionCommand } from '../commands/update-subscription.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler implements ICommandHandler<UpdateSubscriptionCommand> {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async execute(command: UpdateSubscriptionCommand): Promise<Subscription> {
    const { id, userId, ...updateFields } = command;

    const subscription = await this.subscriptionModel.findById(id).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this subscription');
    }

    return this.subscriptionModel.findByIdAndUpdate(id, updateFields, { new: true }).exec();
  }
}
