import { Terminal } from '../../domain/entities/Terminal';

export interface ITerminalRepository {
  create(terminal: Terminal): Promise<void>;
  findById(id: string): Promise<Terminal | null>;
  findByStoreId(storeId: string): Promise<Terminal[]>;
}
