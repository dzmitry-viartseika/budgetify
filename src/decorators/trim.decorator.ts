import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Trim = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const transactionId = request.params.transactionId;

  return typeof transactionId === 'string' ? transactionId.trim() : transactionId;
});
