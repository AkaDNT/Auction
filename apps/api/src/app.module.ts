import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import path from 'path';
import { LoggerModule } from 'nestjs-pino';
import { getTraceId } from '@repo/shared';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuctionCategoryModule } from './modules/auction-category/auction-category.module';
import { AuctionModule } from './modules/auction/auction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        // JSON structured
        level: process.env.LOG_LEVEL || 'info',
        // Automatically add traceId to all log lines
        customProps: () => ({
          traceId: getTraceId(),
        }),

        // Redact sensitive fields
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          remove: true,
        },

        // Reformat key
        // messageKey: "message",
      },
    }),
    AuthModule,
    PrismaModule,
    AuctionCategoryModule,
    AuctionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
