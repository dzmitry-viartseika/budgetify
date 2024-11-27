import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { DeleteSubscriptionCommand } from '../commands/delete-subscription.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteSubscriptionCommand)
export class DeleteSubscriptionHandler implements ICommandHandler<DeleteSubscriptionCommand> {
  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>) {}

  async execute(command: DeleteSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionModel.findById(command.id).exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== command.userId) {
      throw new ForbiddenException('You do not have permission to delete this subscription');
    }

    await this.subscriptionModel.findByIdAndDelete(command.id).exec();
  }
}
