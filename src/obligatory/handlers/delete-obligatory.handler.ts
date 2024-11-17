import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { DeleteObligatoryCommand } from '../commands/delete-obligatory.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteObligatoryCommand)
export class DeleteObligatoryHandler implements ICommandHandler<DeleteObligatoryCommand> {
  constructor(@InjectModel(Obligatory.name) private subscriptionModel: Model<ObligatoryDocument>) {}

  async execute(command: DeleteObligatoryCommand): Promise<void> {
    const subscription = await this.subscriptionModel.findById(command.id).exec();

    if (!subscription) {
      throw new NotFoundException('Obligatory not found');
    }

    if (subscription.userId !== command.userId) {
      throw new ForbiddenException('You do not have permission to delete this obligatory');
    }

    await this.subscriptionModel.findByIdAndDelete(command.id).exec();
  }
}
