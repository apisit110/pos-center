import { Terminal } from '../../domain/entities/Terminal';
import { TerminalRepository } from '../../domain/repositories/TerminalRepository';
import ApiClient, { API_V1, unwrap } from '../api/ApiClient';

interface TerminalResponse {
  uid: string;
  store_uid: string;
  tid: string;
  name: string;
}

export class ApiTerminalRepository implements TerminalRepository {
  public async getTerminalsByStoreId(storeId: string): Promise<Terminal[]> {
    try {
      const response = await ApiClient.get(`${API_V1}/stores/${storeId}/terminals`);
      return unwrap<TerminalResponse[]>(response).map((t) => new Terminal(t.uid, t.store_uid, t.tid));
    } catch {
      return [];
    }
  }
}
