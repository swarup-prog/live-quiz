import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { getRedisConfig } from 'src/config/redis.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';
export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (ConfigService: ConfigService) => {
        const redis = new Redis(getRedisConfig(ConfigService));

        redis.on('error', (err) => {
          console.error('Redis Client Error:', err);
        });

        redis.on('connect', () => {
          console.log('Redis client connected');
        });

        return redis;
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_PUBLISHER,
      useFactory: (ConfigService: ConfigService) => {
        const redis = new Redis(getRedisConfig(ConfigService));
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_SUBSCRIBER,
      useFactory: (ConfigService: ConfigService) => {
        const redis = new Redis(getRedisConfig(ConfigService));
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT, REDIS_SUBSCRIBER, REDIS_PUBLISHER],
})
export class RedisModule {}
