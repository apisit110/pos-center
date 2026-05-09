import { Terminal } from '../../domain/entities/Terminal';
import { TerminalRepository } from '../../application/repositories/TerminalRepository';
import ApiClient from '../api/ApiClient';

export class ApiTerminalRepository implements TerminalRepository {
  public async getTerminalsByStoreId(storeId: string): Promise<Terminal[]> {
    try {
      const response = await ApiClient.get(`/stores/${storeId}/terminals`);
      const data = response.data;
      return data.map((t: any) => new Terminal(t.id || t.uid, t.storeId, t.tid));
    } catch (error) {
      return [];
    }
  }
}
