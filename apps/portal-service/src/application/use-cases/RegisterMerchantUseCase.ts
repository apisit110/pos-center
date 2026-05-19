import { createHash } from 'crypto';
import { Merchant } from '../../domain/entities/Merchant';
import { Store } from '../../domain/entities/Store';
import { Staff } from '../../domain/entities/Staff';
import { Terminal } from '../../domain/entities/Terminal';
import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { IStoreRepository } from '../repositories/IStoreRepository';
import { IStaffRepository } from '../repositories/IStaffRepository';
import { ITerminalRepository } from '../repositories/ITerminalRepository';
import { RunningNumberService } from '../../infrastructure/services/RunningNumberService';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterMerchantRequest {
  merchantName: string;
  staffMembers: {
    username: string;
    fullName: string;
    pin: string;
    role: 'manager' | 'cashier';
  }[];
  stores: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    terminals: { name: string }[];
  }[];
}

export class RegisterMerchantUseCase {
  constructor(
    private readonly merchantRepository: IMerchantRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly terminalRepository: ITerminalRepository,
    private readonly runningNumberService: RunningNumberService,
    private readonly staffRepository: IStaffRepository
  ) {}

  public async execute(request: RegisterMerchantRequest): Promise<Merchant> {
    const merchantUid = uuidv4();
    const mid = await this.runningNumberService.nextMid();

    const merchant = new Merchant(merchantUid, mid, request.merchantName);
    await this.merchantRepository.save(merchant);

    for (const staffReq of request.staffMembers) {
      const pinHash = createHash('sha256').update(staffReq.pin).digest('hex');
      const staff = new Staff(
        uuidv4(),
        merchantUid,
        staffReq.fullName,
        staffReq.role,
        staffReq.username,
        pinHash,
        'active'
      );
      await this.staffRepository.save(staff);
    }

    if (request.stores) {
      for (const storeReq of request.stores) {
        const storeUid = uuidv4();
        const sid = await this.runningNumberService.nextSid(mid);

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
            const tid = await this.runningNumberService.nextTid(sid);
            const terminal = new Terminal(terminalUid, storeUid, tid, terminalReq.name);
            await this.terminalRepository.create(terminal);
          }
        }
      }
    }

    return merchant;
  }
}
