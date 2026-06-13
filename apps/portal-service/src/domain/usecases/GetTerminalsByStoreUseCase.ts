import { ITerminalRepository } from '../repositories/ITerminalRepository';
import { Terminal } from '../entities/Terminal';

export class GetTerminalsByStoreUseCase {
  constructor(private terminalRepository: ITerminalRepository) {}

  async execute(storeId: string): Promise<Terminal[]> {
    return this.terminalRepository.findByStoreId(storeId);
  }
}
