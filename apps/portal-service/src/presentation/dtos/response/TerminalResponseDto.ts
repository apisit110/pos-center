import { Terminal } from '../../../domain/entities/Terminal';

export interface TerminalResponseDto {
  id: string;
  storeId: string;
  tid: string;
  name: string;
}

export function toTerminalResponseDto(terminal: Terminal): TerminalResponseDto {
  return {
    id: terminal.id,
    storeId: terminal.storeId,
    tid: terminal.tid,
    name: terminal.name,
  };
}
