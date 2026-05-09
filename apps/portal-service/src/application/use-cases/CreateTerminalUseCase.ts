import { Terminal } from '../../domain/entities/Terminal';
import { ITerminalRepository } from '../repositories/ITerminalRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTerminalRequest {
  storeId: string;
  tid: string;
}

export class CreateTerminalUseCase {
  constructor(private readonly terminalRepository: ITerminalRepository) {}

  public async execute(request: CreateTerminalRequest): Promise<Terminal> {
    const id = uuidv4();
    
    const terminal = new Terminal(
      id,
      request.storeId,
      request.tid
    );
    
    await this.terminalRepository.create(terminal);
    
    return terminal;
  }
}
