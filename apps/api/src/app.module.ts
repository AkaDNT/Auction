import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { buildRedisConnection, getTraceId } from '@repo/shared';
import { LoggerModule } from 'nestjs-pino';
import path from 'path';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RedisModule } from './common/redis/redis.module';
import { AuctionModule } from './modules/auction/auction.module';
import { AuctionCategoryModule } from './modules/auction-category/auction-category.module';
import { AuctionContentModule } from './modules/auction-content/auction-content.module';
import { AuctionImageModule } from './modules/auction-image/auction-image.module';
import { AuctionLifecycleModule } from './modules/auction-lifecycle/auction-lifecycle.module';
import { AuthModule } from './modules/auth/auth.module';
import { BidModule } from './modules/bid/bid.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UploadAssetModule } from './modules/upload-asset/upload-asset.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');

        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const db = config.get<number>(
          'REDIS_CACHE_DB',
          config.get<number>('REDIS_DB', 0),
        );
        const username = config.get<string>('REDIS_USERNAME');
        const password = config.get<string>('REDIS_PASSWORD');

        const cacheRedisUrl =
          redisUrl ??
          `redis://${username ? `${username}:` : ''}${
            password ? `${encodeURIComponent(password)}@` : ''
          }${host}:${port}/${db}`;

        return {
          ttl: config.get<number>('CACHE_DEFAULT_TTL_MS', 30_000),
          stores: [new KeyvRedis(cacheRedisUrl)],
        };
      },
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
    WalletModule,
    ProfileModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
