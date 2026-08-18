import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheService {
  private readonly redis: Redis | null;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Only connect if real credentials are provided (not placeholder values)
    const isConfigured =
      url &&
      token &&
      !url.includes('your-upstash-instance') &&
      !token.includes('your_upstash_token');

    if (isConfigured) {
      this.redis = new Redis({ url, token });
    } else {
      this.redis = null;
      this.logger.warn(
        'Upstash Redis not configured — caching is disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.',
      );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get<string>(key);
      if (!data) return null;

      const parsed: unknown =
        typeof data === 'string' ? JSON.parse(data) : data;

      return parsed as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key "${key}"`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return;
    try {
      // Use a safe serializer that handles circular references from Drizzle ORM objects
      const seen = new WeakSet();
      const serialized = JSON.stringify(value, (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return undefined; // drop circular ref
          seen.add(val);
        }
        return val;
      });
      await this.redis.set(key, serialized, { ex: ttlSeconds });
    } catch (error) {
      this.logger.error(`Cache SET error for key "${key}"`, error);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.redis || keys.length === 0) return;

    try {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(`Cache DEL error for keys "${keys.join(', ')}"`, error);
    }
  }
}
