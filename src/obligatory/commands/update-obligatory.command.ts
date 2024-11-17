import { ICommand } from '@nestjs/cqrs';

export class UpdateObligatoryCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly amount?: number,
    public readonly paymentStartDate?: Date,
    public readonly paymentEndDate?: Date,
    public readonly userId?: string,
    public readonly description?: string
  ) {}
}
