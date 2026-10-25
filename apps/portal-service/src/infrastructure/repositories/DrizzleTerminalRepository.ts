import { db, terminals, stores, mapStoreTerminal, eq } from '@pos-center/database';
import { ITerminalRepository } from '../../domain/repositories/ITerminalRepository';
import { Terminal } from '../../domain/entities/Terminal';

export class DrizzleTerminalRepository implements ITerminalRepository {
  async findByStoreId(storeId: string): Promise<Terminal[]> {
    const results = await db.select({
      uid: terminals.uid,
      tid: terminals.tid,
      nameEn: terminals.nameEn,
      nameTh: terminals.nameTh,
    })
      .from(mapStoreTerminal)
      .innerJoin(stores, eq(mapStoreTerminal.storeId, stores.id))
      .innerJoin(terminals, eq(mapStoreTerminal.terminalId, terminals.id))
      .where(eq(stores.uid, storeId));

    return results.map(r => new Terminal(r.uid, storeId, r.tid, r.nameEn, r.nameTh));
  }
}
