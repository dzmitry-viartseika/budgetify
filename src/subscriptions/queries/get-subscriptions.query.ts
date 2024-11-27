import { IQuery } from '@nestjs/cqrs';

export class GetSubscriptionsQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly search?: string,
    public readonly userId?: string
  ) {}
}
