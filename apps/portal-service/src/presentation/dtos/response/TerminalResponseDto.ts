import { Terminal } from '../../../domain/entities/Terminal';

export interface TerminalResponseDto {
  uid: string;
  store_uid: string;
  tid: string;
  name: string;
}

export function toTerminalResponseDto(terminal: Terminal): TerminalResponseDto {
  return {
    uid: terminal.id,
    store_uid: terminal.storeId,
    tid: terminal.tid,
    name: terminal.name,
  };
}
