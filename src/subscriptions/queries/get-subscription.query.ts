import { IQuery } from '@nestjs/cqrs';

export class GetSubscriptionQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}
}
