import { Terminal } from '../../domain/entities/Terminal';

export interface ITerminalRepository {
  findByStoreId(storeId: string): Promise<Terminal[]>;
}
