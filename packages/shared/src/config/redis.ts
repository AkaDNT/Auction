export type RedisConnectionConfigInput = {
  redisUrl?: string;
  redisHost?: string;
  redisPort?: number;
  redisDb?: number;
  redisUsername?: string;
  redisPassword?: string;
};

export function buildRedisConnection(input: RedisConnectionConfigInput) {
  const {
    redisUrl,
    redisHost = "127.0.0.1",
    redisPort = 6379,
    redisDb = 0,
    redisUsername,
    redisPassword,
  } = input;

  if (redisUrl) {
    const url = new URL(redisUrl);

    const dbFromPath = url.pathname?.replace("/", "");
    const db =
      dbFromPath && dbFromPath.length > 0 ? Number(dbFromPath) : redisDb;

    return {
      host: url.hostname,
      port: Number(url.port || 6379),
      username: url.username || undefined,
      password: url.password || undefined,
      db,
    };
  }

  return {
    host: redisHost,
    port: redisPort,
    db: redisDb,
    username: redisUsername || undefined,
    password: redisPassword || undefined,
  };
}
