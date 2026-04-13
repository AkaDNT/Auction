import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

type RedisClient = ReturnType<typeof createClient>;

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: RedisClient | null = null;
  private subClient: RedisClient | null = null;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(redisUrl: string) {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.pubClient = pubClient;
    this.subClient = subClient;
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    if (!this.adapterConstructor) {
      throw new Error('Redis Socket.IO adapter has not been initialized');
    }

    server.adapter(this.adapterConstructor);
    return server;
  }

  async closeConnections() {
    const tasks: Promise<unknown>[] = [];

    if (this.pubClient) tasks.push(this.pubClient.quit());
    if (this.subClient) tasks.push(this.subClient.quit());

    await Promise.allSettled(tasks);
  }
}
