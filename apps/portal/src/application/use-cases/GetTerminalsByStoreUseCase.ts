import { Terminal } from '../../domain/entities/Terminal';
import { TerminalRepository } from '../repositories/TerminalRepository';

export class GetTerminalsByStoreUseCase {
  constructor(private terminalRepository: TerminalRepository) {}

  async execute(storeId: string): Promise<Terminal[]> {
    return this.terminalRepository.getTerminalsByStoreId(storeId);
  }
}
