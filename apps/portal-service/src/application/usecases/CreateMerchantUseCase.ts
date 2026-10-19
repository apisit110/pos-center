import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from '../../domain/entities/Merchant';
import { Staff, StaffRole } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { ITerminalRepository } from '../../domain/repositories/ITerminalRepository';
import { IRunningNumberService } from '../../domain/services/IRunningNumberService';

export interface CreateMerchantRequest {
  name: string;
  staffMembers: { fullName: string; pin: string; role: StaffRole }[];
  stores: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    terminals: { name: string }[];
  }[];
}

const MAX_MID_ATTEMPTS = 10;
const PIN_HASH_ROUNDS = 10;

/** Creates a merchant together with its staff, stores and terminals. */
export class CreateMerchantUseCase {
  constructor(
    private readonly merchantRepository: IMerchantRepository,
    private readonly staffRepository: IStaffRepository,
    private readonly storeRepository: IStoreRepository,
    private readonly terminalRepository: ITerminalRepository,
    private readonly runningNumberService: IRunningNumberService,
  ) {}

  public async execute(request: CreateMerchantRequest): Promise<Merchant> {
    const merchantUid = uuidv4();
    const mid = await this.generateUniqueMid();

    const merchant = new Merchant(merchantUid, mid, request.name);
    await this.merchantRepository.save(merchant);

    for (const staffReq of request.staffMembers) {
      const username = await this.runningNumberService.nextStaffUsername(mid);
      const pinHash = await bcrypt.hash(staffReq.pin, PIN_HASH_ROUNDS);
      await this.staffRepository.save(
        new Staff(uuidv4(), merchantUid, staffReq.fullName, staffReq.role, username, pinHash, 'ACTIVE'),
      );
    }

    for (const storeReq of request.stores) {
      const storeUid = uuidv4();
      const sid = await this.runningNumberService.nextSid(mid);
      await this.storeRepository.save(
        new Store(storeUid, sid, merchantUid, mid, storeReq.name, storeReq.address, storeReq.latitude, storeReq.longitude),
      );

      for (const terminalReq of storeReq.terminals) {
        const tid = await this.runningNumberService.nextTid(sid);
        await this.terminalRepository.create(new Terminal(uuidv4(), storeUid, tid, terminalReq.name));
      }
    }

    return merchant;
  }

  /** Generates a mid; if it already exists, generates a new one and retries. */
  private async generateUniqueMid(): Promise<string> {
    for (let attempt = 0; attempt < MAX_MID_ATTEMPTS; attempt++) {
      const mid = await this.runningNumberService.nextMid();
      if (!(await this.merchantRepository.getByMid(mid))) return mid;
    }
    throw new Error('Cannot generate a unique merchant id (mid)');
  }
}
