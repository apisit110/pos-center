import { db, terminals, stores, eq } from '@lightning/database';
import { ITerminalRepository } from '../../application/repositories/ITerminalRepository';
import { Terminal } from '../../domain/entities/Terminal';

export class DrizzleTerminalRepository implements ITerminalRepository {
  async create(terminal: Terminal): Promise<void> {
    const store = await db.query.stores.findFirst({
      where: eq(stores.uid, terminal.storeId)
    });

    if (!store) throw new Error('Store not found');

    await db.insert(terminals).values({
      uid: terminal.id,
      storeId: store.id,
      tid: terminal.tid,
    });
  }

  async findById(id: string): Promise<Terminal | null> {
    const result = await db.query.terminals.findFirst({
      where: eq(terminals.uid, id),
    });

    if (!result) return null;

    // Need to get store uid
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, result.storeId)
    });

    return new Terminal(result.uid, store?.uid || '', result.tid);
  }

  async findByStoreId(storeId: string): Promise<Terminal[]> {
    const store = await db.query.stores.findFirst({
      where: eq(stores.uid, storeId)
    });

    if (!store) return [];

    const results = await db.select().from(terminals).where(eq(terminals.storeId, store.id));
    
    return results.map(r => new Terminal(r.uid, storeId, r.tid));
  }
}
