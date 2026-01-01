import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

/**
 * This service provides high-level caching abstractions
 * with built-up serialization, TTL management, and error handling
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  /**
   * Get cached with automatic deserialization
   * Type-safe retrival with generic support
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}: `, error);
      return null;
    }
  }

  /**
   * Set value with automatic serialization and optional TTL
   * TTL in seconds, 0 means no expiration
   */
  async set<T>(key: string, value: T, ttlSeconds = 0): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttlSeconds > 0) {
        await this.redisClient.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redisClient.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}: `, error);
      return false;
    }
  }

  /**
   * Delete single or multiple keys
   */
  async delete(...keys: string[]): Promise<number> {
    try {
      return await this.redisClient.del(...keys);
    } catch (error) {
      this.logger.error(`Error deleting keys: `, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   * Useful for quick presence checks without retrieving data
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple keys in a single operation (Pipeline optimization)
   * Reduces network round trips - critical for performance
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];

      const values = await this.redisClient.mget(...keys);
      return values.map((value) => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error(`Error getting multiple keys:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs atomically using pipeline
   * 10x faster than individual set operations
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<boolean> {
    try {
      const pipeline = this.redisClient.pipeline();

      for (const entry of entries) {
        const serialized = JSON.stringify(entry.value);
        if (entry.ttl && entry.ttl > 0) {
          pipeline.setex(entry.key, entry.ttl, serialized);
        } else {
          pipeline.set(entry.key, serialized);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      this.logger.error(`Error setting multiple keys:`, error);
      return false;
    }
  }

  /**
   * Increment counter atomically
   * Perfect for real-time participant counting
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redisClient.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get keys matching pattern
   * Useful for cleanup operations, but avoid in hot paths
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiration on key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -2; // Key doesn't exist
    }
  }

  /**
   * Atomic operations for sorted sets (leaderboard optimization)
   * O(log N) insertion, perfect for real-time rankings
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.redisClient.zadd(key, score, member);
    } catch (error) {
      this.logger.error(`Error adding to sorted set ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get sorted set range with scores (descending order for leaderboard)
   */
  async zrevrangeWithScores(
    key: string,
    start: number = 0,
    stop: number = -1,
  ): Promise<Array<{ member: string; score: number }>> {
    try {
      const results = await this.redisClient.zrevrange(
        key,
        start,
        stop,
        'WITHSCORES',
      );

      const parsed: Array<{ member: string; score: number }> = [];
      for (let i = 0; i < results.length; i += 2) {
        parsed.push({
          member: results[i],
          score: parseFloat(results[i + 1]),
        });
      }

      return parsed;
    } catch (error) {
      this.logger.error(`Error getting sorted set range ${key}:`, error);
      return [];
    }
  }

  /**
   * Get member rank in sorted set (1-indexed)
   */
  async zrevrank(key: string, member: string): Promise<number | null> {
    try {
      const rank = await this.redisClient.zrevrank(key, member);
      return rank !== null ? rank + 1 : null; // Convert to 1-indexed
    } catch (error) {
      this.logger.error(`Error getting rank for ${member} in ${key}:`, error);
      return null;
    }
  }

  /**
   * Hash operations for complex objects (room state optimization)
   */
  async hset(key: string, field: string, value: any): Promise<number> {
    try {
      const serialized =
        typeof value === 'string' ? value : JSON.stringify(value);
      return await this.redisClient.hset(key, field, serialized);
    } catch (error) {
      this.logger.error(`Error setting hash field ${field} in ${key}:`, error);
      return 0;
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redisClient.hget(key, field);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      this.logger.error(
        `Error getting hash field ${field} from ${key}:`,
        error,
      );
      return null;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await this.redisClient.hgetall(key);
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          result[field] = value as T;
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error getting all hash fields from ${key}:`, error);
      return {};
    }
  }

  /**
   * Multiple hash set operations (pipeline optimization)
   */
  async hmset(key: string, data: Record<string, any>): Promise<boolean> {
    try {
      const serialized: Record<string, string> = {};
      for (const [field, value] of Object.entries(data)) {
        serialized[field] =
          typeof value === 'string' ? value : JSON.stringify(value);
      }

      await this.redisClient.hmset(key, serialized);
      return true;
    } catch (error) {
      this.logger.error(`Error setting multiple hash fields in ${key}:`, error);
      return false;
    }
  }

  /**
   * Pub/Sub for real-time events across multiple instances
   */
  async publish(channel: string, message: any): Promise<number> {
    try {
      const serialized =
        typeof message === 'string' ? message : JSON.stringify(message);
      return await this.redisClient.publish(channel, serialized);
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error);
      return 0;
    }
  }
}
