import { ICommand } from '@nestjs/cqrs';

export class DeleteObligatoryCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly id: string
  ) {}
}
