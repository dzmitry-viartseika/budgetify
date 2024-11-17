import { IQuery } from '@nestjs/cqrs';

export class GetObligatoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}
}
