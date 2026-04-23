import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';
import { LoggerModule } from 'nestjs-pino';
import { buildRedisConnection, getTraceId } from '@repo/shared';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuctionCategoryModule } from './modules/auction-category/auction-category.module';
import { AuctionModule } from './modules/auction/auction.module';
import { AuctionImageModule } from './modules/auction-image/auction-image.module';
import { BidModule } from './modules/bid/bid.module';
import { AuctionContentModule } from './modules/auction-content/auction-content.module';
import { BullModule } from '@nestjs/bullmq';
import { AuctionLifecycleModule } from './modules/auction-lifecycle/auction-lifecycle.module';
import { UploadAssetModule } from './modules/upload-asset/upload-asset.module';

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: buildRedisConnection({
          redisUrl: config.get<string>('REDIS_URL'),
          redisHost: config.get<string>('REDIS_HOST'),
          redisPort: config.get<number>('REDIS_PORT'),
          redisDb: config.get<number>('REDIS_DB'),
          redisUsername: config.get<string>('REDIS_USERNAME'),
          redisPassword: config.get<string>('REDIS_PASSWORD'),
        }),
        prefix: config.get<string>('REDIS_KEY_PREFIX', 'auction:'),
      }),
    }),
    AuthModule,
    PrismaModule,
    AuctionCategoryModule,
    AuctionModule,
    AuctionImageModule,
    BidModule,
    AuctionContentModule,
    AuctionLifecycleModule,
    UploadAssetModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
