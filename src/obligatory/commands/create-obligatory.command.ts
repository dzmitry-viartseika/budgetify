import { ICommand } from '@nestjs/cqrs';

export class CreateObligatoryCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly amount: number,
    public readonly paymentStartDate: Date,
    public readonly paymentEndDate: Date,
    public readonly description: string,
    public readonly userId: string,
    public readonly cardId: string
  ) {}
}
