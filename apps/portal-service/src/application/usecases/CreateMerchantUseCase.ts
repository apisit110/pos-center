import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from '../../domain/entities/Merchant';
import { Staff, StaffRole } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { ValidationError } from '../errors/ValidationError';
import { validatePinPolicy } from '../../domain/services/PinPolicy';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
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
    private readonly runningNumberService: IRunningNumberService,
  ) {}

  public async execute(request: CreateMerchantRequest): Promise<Merchant> {
    request.staffMembers.forEach((staffReq, index) => {
      const policy = validatePinPolicy(staffReq.pin);
      if (policy.status === 'failed') {
        throw ValidationError.ErrInvalidRequest(`staff_members.${index}.pin: ${policy.message}`);
      }
    });

    const merchantUid = uuidv4();
    const mid = await this.generateUniqueMid();
    const merchant = new Merchant(merchantUid, mid, request.name);

    const staffMembers: Staff[] = [];
    for (const staffReq of request.staffMembers) {
      const username = await this.runningNumberService.nextStaffUsername(mid);
      const pinHash = await bcrypt.hash(staffReq.pin, PIN_HASH_ROUNDS);
      staffMembers.push(new Staff(uuidv4(), merchantUid, staffReq.fullName, staffReq.role, username, pinHash, 'ACTIVE'));
    }

    const stores: { store: Store; terminals: Terminal[] }[] = [];
    for (const storeReq of request.stores) {
      const storeUid = uuidv4();
      const sid = await this.runningNumberService.nextSid(mid);
      const terminals: Terminal[] = [];
      for (const terminalReq of storeReq.terminals) {
        const tid = await this.runningNumberService.nextTid(sid);
        terminals.push(new Terminal(uuidv4(), storeUid, tid, terminalReq.name));
      }
      stores.push({
        store: new Store(storeUid, sid, merchantUid, mid, storeReq.name, storeReq.address, storeReq.latitude, storeReq.longitude),
        terminals,
      });
    }

    await this.merchantRepository.createWithMembers(merchant, staffMembers, stores);
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
