import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(response: any, status: HttpStatus) {
    super(response, status);
  }
}
