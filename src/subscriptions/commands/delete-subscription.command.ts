import { ICommand } from '@nestjs/cqrs';

export class DeleteSubscriptionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}
}
