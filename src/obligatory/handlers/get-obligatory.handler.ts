import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { GetObligatoryQuery } from '../queries/get-obligatory.query';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@QueryHandler(GetObligatoryQuery)
export class GetObligatoryHandler implements IQueryHandler<GetObligatoryQuery> {
  constructor(@InjectModel(Obligatory.name) private subscriptionModel: Model<ObligatoryDocument>) {}

  async execute(query: GetObligatoryQuery): Promise<Obligatory> {
    const subscription = await this.subscriptionModel.findById(query.id).exec();

    if (!subscription) {
      throw new NotFoundException('Obligatory not found');
    }

    if (subscription.userId !== query.userId) {
      throw new ForbiddenException('You do not have permission to read this obligatory');
    }

    return this.subscriptionModel.findById(query.id).exec();
  }
}
