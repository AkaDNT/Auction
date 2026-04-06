import { HttpException, HttpStatus } from '@nestjs/common';

export type AppErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export class AppException extends HttpException {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(payload: AppErrorPayload, status: HttpStatus) {
    super(payload.message, status);
    this.code = payload.code;
    this.details = payload.details;
  }
}
