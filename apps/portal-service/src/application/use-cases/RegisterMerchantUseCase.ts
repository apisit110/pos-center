import { Merchant } from '../../domain/entities/Merchant';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { IStoreRepository } from '../repositories/IStoreRepository';
import { ITerminalRepository } from '../repositories/ITerminalRepository';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterMerchantRequest {
  merchantName: string;
  stores: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    terminals: {
      tid: string;
    }[];
  }[];
}

export class RegisterMerchantUseCase {
  constructor(
    private readonly merchantRepository: IMerchantRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly terminalRepository: ITerminalRepository
  ) {}

  public async execute(request: RegisterMerchantRequest): Promise<Merchant> {
    const merchantUid = uuidv4();
    const mid = 'MID' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const merchant = new Merchant(merchantUid, mid, request.merchantName);
    await this.merchantRepository.save(merchant);

    if (request.stores) {
      for (const storeReq of request.stores) {
        const storeUid = uuidv4();
        const sid = 'SID' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        
        const store = new Store(
          storeUid,
          sid,
          merchantUid,
          mid,
          storeReq.name,
          storeReq.address,
          storeReq.latitude,
          storeReq.longitude
        );
        await this.storeRepository.save(store);

        if (storeReq.terminals) {
          for (const terminalReq of storeReq.terminals) {
            const terminalUid = uuidv4();
            const terminal = new Terminal(
              terminalUid,
              storeUid,
              terminalReq.tid
            );
            await this.terminalRepository.create(terminal);
          }
        }
      }
    }
    
    return merchant;
  }
}
