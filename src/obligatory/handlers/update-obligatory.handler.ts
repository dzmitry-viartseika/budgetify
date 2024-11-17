import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { UpdateObligatoryCommand } from '../commands/update-obligatory.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateObligatoryCommand)
export class UpdateObligatoryHandler implements ICommandHandler<UpdateObligatoryCommand> {
  constructor(@InjectModel(Obligatory.name) private subscriptionModel: Model<ObligatoryDocument>) {}

  async execute(command: UpdateObligatoryCommand): Promise<Obligatory> {
    const { id, userId, ...updateFields } = command;

    const subscription = await this.subscriptionModel.findById(id).exec();

    if (!subscription) {
      throw new NotFoundException('Obligatory not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this obligatory');
    }

    return this.subscriptionModel.findByIdAndUpdate(id, updateFields, { new: true }).exec();
  }
}
