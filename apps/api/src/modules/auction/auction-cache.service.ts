import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/common/redis/redis.constants';

import { ListAuctionDto } from './dto/list-auction.dto';

@Injectable()
export class AuctionCacheService {
  private readonly versionKey = 'auction:cache:v';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ) {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached) as T;

    const value = await factory();
    const serialized = JSON.stringify(value);

    const sizeInBytes = Buffer.byteLength(serialized, 'utf8');

    if (sizeInBytes > 100 * 1024) {
      return value;
    }

    await this.redis.set(key, serialized, 'EX', ttlSeconds);
    return value;
  }

  async bumpVersion() {
    await this.redis.set(this.versionKey, Date.now().toString());
  }

  async listKey(query: ListAuctionDto) {
    return `auction:cache:list:v${await this.version()}:${this.hash(query)}`;
  }

  async featuredKey() {
    return `auction:cache:featured:v${await this.version()}`;
  }

  private async version() {
    return (await this.redis.get(this.versionKey)) ?? '1';
  }

  private hash(value: unknown) {
    return createHash('sha1')
      .update(JSON.stringify(value))
      .digest('hex')
      .slice(0, 16);
  }
}
