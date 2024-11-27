import { ICommand } from '@nestjs/cqrs';

export class CreateSubscriptionCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly categories: string[],
    public readonly amount: number,
    public readonly paymentStartDate: Date,
    public readonly paymentEndDate: Date,
    public readonly description: string,
    public readonly userId: string,
    public readonly cardId: string
  ) {}
}
