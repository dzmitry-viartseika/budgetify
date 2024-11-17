import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { DeleteObligatoryCommand } from '../commands/delete-obligatory.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteObligatoryCommand)
export class DeleteObligatoryHandler implements ICommandHandler<DeleteObligatoryCommand> {
  constructor(@InjectModel(Obligatory.name) private obligatoryModel: Model<ObligatoryDocument>) {}

  async execute(command: DeleteObligatoryCommand): Promise<void> {
    const obligatory = await this.obligatoryModel.findById(command.id).exec();

    if (!obligatory) {
      throw new NotFoundException('Obligatory not found');
    }

    if (obligatory.userId !== command.userId) {
      throw new ForbiddenException('You do not have permission to delete this obligatory');
    }

    await this.obligatoryModel.findByIdAndDelete(command.id).exec();
  }
}
