import { eq, sql } from 'drizzle-orm';
import { rateLimits } from '@pos-center/models';
import { db } from './index';

// rows whose window ended a day ago are dropped now and then by increment()
const CLEANUP_CHANCE = 0.01;

/**
 * express-rate-limit store backed by the `rate_limits` table, so the limit holds across
 * Lambda instances and cold starts. Shaped after the library's `Store` interface:
 * `rateLimit({ store: new PostgresRateLimitStore('portal-login') })`.
 */
export class PostgresRateLimitStore {
  localKeys = false;
  private windowMs = 60 * 1000;

  constructor(public prefix: string) {}

  init(options: { windowMs: number }): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const resetAt = new Date(Date.now() + this.windowMs);
    // a single upsert: start a new window when the old one has ended, otherwise count the hit
    const [row] = await db
      .insert(rateLimits)
      .values({ key: this.key(key), hits: 1, resetAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          hits: sql`case when ${rateLimits.resetAt} <= now() then 1 else ${rateLimits.hits} + 1 end`,
          resetAt: sql`case when ${rateLimits.resetAt} <= now() then excluded.reset_at else ${rateLimits.resetAt} end`,
        },
      })
      .returning({ hits: rateLimits.hits, resetAt: rateLimits.resetAt });

    if (Math.random() < CLEANUP_CHANCE) {
      await db.delete(rateLimits).where(sql`${rateLimits.resetAt} < now() - interval '1 day'`);
    }

    return { totalHits: row.hits, resetTime: row.resetAt };
  }

  async decrement(key: string): Promise<void> {
    await db
      .update(rateLimits)
      .set({ hits: sql`greatest(${rateLimits.hits} - 1, 0)` })
      .where(eq(rateLimits.key, this.key(key)));
  }

  async resetKey(key: string): Promise<void> {
    await db.delete(rateLimits).where(eq(rateLimits.key, this.key(key)));
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }
}
