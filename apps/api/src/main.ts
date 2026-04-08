import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { traceIdMiddleware } from './common/middleware/trace.middleware';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppException } from './common/errors/app.exception';
import { Logger } from 'nestjs-pino';
import { ERROR_CODES } from '@repo/shared';

async function bootstrap() {
  function formatValidation(errors: ValidationError[]) {
    //FE map: [{ field, constraints }]
    return errors.map((e) => ({
      field: e.property,
      constraints: e.constraints ?? null,
    }));
  }
  // Buffer logs true to avoid log init loss
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(Logger));
  const config = app.get(ConfigService);
  const port = config.get<string>('PORT') ?? 3999;
  app.use(traceIdMiddleware);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        throw new AppException(
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Dữ liệu không hợp lệ',
            details: formatValidation(errors),
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );
  app.enableCors({
    origin: [config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000'],
    credentials: true,
  });
  await app.listen(port);
}
bootstrap();
