import { Terminal } from '../../domain/entities/Terminal';

export interface TerminalRepository {
  getTerminalsByStoreId(storeId: string): Promise<Terminal[]>;
}
