import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { CreateObligatoryCommand } from '../commands/create-obligatory.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { request } from 'express';

@CommandHandler(CreateObligatoryCommand)
export class CreateObligatoryHandler implements ICommandHandler<CreateObligatoryCommand> {
  constructor(@InjectModel(Obligatory.name) private subscriptionModel: Model<ObligatoryDocument>) {}

  async execute(command: CreateObligatoryCommand): Promise<Obligatory> {
    const { title, amount, paymentStartDate, paymentEndDate, description, userId, cardId } = command;

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

    const newObligatory = await this.subscriptionModel.create({
      title,
      amount,
      paymentStartDate,
      paymentEndDate,
      description,
      userId,
      cardId,
    });
    return newObligatory;
  }
}
