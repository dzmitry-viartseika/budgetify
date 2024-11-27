import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { GetObligatoryQuery } from '../queries/get-obligatory.query';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@QueryHandler(GetObligatoryQuery)
export class GetObligatoryHandler implements IQueryHandler<GetObligatoryQuery> {
  constructor(@InjectModel(Obligatory.name) private obligatoryModel: Model<ObligatoryDocument>) {}

  async execute(query: GetObligatoryQuery): Promise<Obligatory> {
    const obligatory = await this.obligatoryModel.findById(query.id).exec();

    if (!obligatory) {
      throw new NotFoundException('Obligatory not found');
    }

    if (obligatory.userId !== query.userId) {
      throw new ForbiddenException('You do not have permission to read this obligatory');
    }

    return this.obligatoryModel.findById(query.id).exec();
  }
}
