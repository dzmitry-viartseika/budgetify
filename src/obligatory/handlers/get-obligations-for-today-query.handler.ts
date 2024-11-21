import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory } from '../schemas/obligatory.schema';
import { GetObligationsForTodayQuery } from '../queries/get-obligations-for-today.query';

@QueryHandler(GetObligationsForTodayQuery)
export class GetObligationsForTodayHandler implements IQueryHandler<GetObligationsForTodayQuery> {
  constructor(@InjectModel(Obligatory.name) private readonly obligatoryModel: Model<Obligatory>) {}

  async execute(): Promise<Obligatory[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    console.log('wertey2');
    return this.obligatoryModel
      .find({
        paymentStartDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();
  }
}
