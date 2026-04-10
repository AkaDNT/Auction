import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../errors/app.exception';
import { mapPrismaError } from '../errors/prisma-error';
import { PinoLogger } from 'nestjs-pino';
import { ERROR_CODES } from '@repo/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { traceId: string }>();
    const res = ctx.getResponse<Response>();
    const traceId = req.traceId ?? 'unknown';
    const path = req.url;
    const method = req.method;

    // Log toàn bộ exception
    this.logger.error(
      `[${traceId}] ${method} ${path} -> ${exception instanceof Error ? exception.stack : exception}`,
    );
    //AppException: Business Errors
    if (exception instanceof AppException) {
      const status = exception.getStatus();
      this.logger.warn(
        `[${traceId}] ${method} ${path} -> ${status} ${exception.code}: ${exception.message}`,
      );
      return res.status(status).json({
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details ?? null,
        },
        traceId,
      });
    }

    //NestHttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;

      // Nest validation pipe return: { message: string[] | string, error, statusCode }
      const message =
        typeof response?.message === 'string'
          ? response.message
          : 'Lỗi yêu cầu';
      const details = Array.isArray(response?.message)
        ? response.message
        : null;

      this.logger.warn(
        `[${traceId}] ${method} ${path} -> ${status} HttpException: ${message}`,
      );

      return res.status(status).json({
        error: {
          code:
            status === HttpStatus.UNAUTHORIZED
              ? ERROR_CODES.AUTH_UNAUTHORIZED
              : status === HttpStatus.FORBIDDEN
                ? ERROR_CODES.AUTH_FORBIDDEN
                : ERROR_CODES.VALIDATION_ERROR,
          message,
          details,
        },
        traceId,
      });
    }

    //PrismaException
    const prismaMapped = mapPrismaError(exception);
    if (prismaMapped) {
      this.logger.warn(
        `[${traceId}] ${method} ${path} -> ${prismaMapped.status} Prisma: ${prismaMapped.code}`,
      );
      return res.status(prismaMapped.status).json({
        error: {
          code: prismaMapped.code,
          message: prismaMapped.message,
          details: prismaMapped.details ?? null,
        },
        traceId,
      });
    }

    //Unknown error => 500
    const err = exception as any;
    this.logger.error(
      `[${traceId}] ${method} ${path} -> 500 INTERNAL_ERROR`,
      err?.stack ?? String(exception),
    );
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Lỗi máy chủ',
        details: null,
      },
      traceId,
    });
  }
}
