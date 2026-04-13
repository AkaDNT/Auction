import { Provider } from '@nestjs/common';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    return new IORedis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      keyPrefix: process.env.REDIS_KEY_PREFIX ?? '',
    });
  },
};
