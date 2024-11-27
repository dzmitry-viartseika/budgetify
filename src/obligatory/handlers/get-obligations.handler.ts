import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { GetObligationsQuery } from '../queries/get-obligations.query';

@QueryHandler(GetObligationsQuery)
export class GetObligationsHandler implements IQueryHandler<GetObligationsQuery> {
  constructor(@InjectModel(Obligatory.name) private obligatoryModel: Model<ObligatoryDocument>) {}

  async execute(
    query: GetObligationsQuery
  ): Promise<{ data: Obligatory[]; total: number; totalPages: number; currentPage: number }> {
    const { page, limit, search, userId } = query;

    const filter = { userId };
    if (search) {
      filter['title'] = { $regex: search, $options: 'i' };
    }

    const data = await this.obligatoryModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.obligatoryModel.countDocuments(filter);

    const totalPages = Math.ceil(total / limit);
    const currentPage = page;

    return { data, total, totalPages, currentPage };
  }
}
