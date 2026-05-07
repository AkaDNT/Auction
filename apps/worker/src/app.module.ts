import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildRedisConnection } from '@repo/shared';
import { AuctionLifecycleModule } from './modules/auction-lifecycle/auction-lifecycle.module';
import { AuctionModule } from './modules/auction/auction.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    AuctionModule,
    PrismaModule,
    AuctionLifecycleModule,
  ],
})
export class AppModule {}
