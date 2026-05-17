import { db, runningNumbers, eq, sql } from '@lightning/database';

const DIGITS = { mid: 4, sid: 4, tid: 2 } as const;

export class RunningNumberService {
  private async next(key: string, digits: number): Promise<string> {
    await db
      .insert(runningNumbers)
      .values({ type: key, number: 1 })
      .onConflictDoUpdate({
        target: runningNumbers.type,
        set: { number: sql`${runningNumbers.number} + 1`, updatedAt: sql`now()` },
      });

    const row = await db.query.runningNumbers.findFirst({
      where: eq(runningNumbers.type, key),
    });

    const num = row!.number;
    const max = Math.pow(10, digits);

    if (num >= max) {
      throw new Error(`Running number overflow for key "${key}": ${num} exceeds ${digits}-digit limit`);
    }

    return num.toString().padStart(digits, '0');
  }

  async nextMid(): Promise<string> {
    return this.next('mid', DIGITS.mid);
  }

  async nextSid(mid: string): Promise<string> {
    return this.next(`sid:${mid}`, DIGITS.sid);
  }

  async nextTid(sid: string): Promise<string> {
    return this.next(`tid:${sid}`, DIGITS.tid);
  }
}
