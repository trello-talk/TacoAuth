import Redis, { RedisOptions } from 'ioredis';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

let redis: Redis;

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  keyPrefix: process.env.REDIS_PREFIX,
  password: process.env.REDIS_PASSWORD
};

if (!process.browser) {
  if (process.env.NODE_ENV === 'production') {
    redis = new Redis(redisOptions);
  } else {
    if (!(global as any).redis) {
      (global as any).redis = new Redis(redisOptions);
    }
    redis = (global as any).redis;
  }
}
export default redis;
