import { merchants, sql } from '@pos-center/database';

/**
 * `merchants.uid` is a uuid column, so comparing it with a value that is not a uuid makes postgres throw.
 * Comparing as text lets a malformed uid simply match nothing (not found).
 */
export const merchantUidIs = (uid: string) => sql`${merchants.uid}::text = ${uid}`;
