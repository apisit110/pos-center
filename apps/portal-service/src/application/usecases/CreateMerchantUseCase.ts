import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from '../../domain/entities/Merchant';
import { Staff } from '../../domain/entities/Staff';
import { Store } from '../../domain/entities/Store';
import { Terminal } from '../../domain/entities/Terminal';
import { ValidationError } from '../errors/ValidationError';
import { validatePinPolicy } from '../../domain/services/PinPolicy';
import { IMerchantRepository, NewCashierStaff, NewStore } from '../../domain/repositories/IMerchantRepository';
import { ICashierStaffRepository } from '../../domain/repositories/ICashierStaffRepository';
import { AddressInput, IAddressRepository, ResolvedAddress } from '../../domain/repositories/IAddressRepository';
import { IRunningNumberService } from '../../domain/services/IRunningNumberService';

export interface CreateMerchantRequest {
  nameEn: string;
  nameTh: string;
  cashierStaff: { fullName: string; pin: string; role: string }[];
  stores: {
    nameEn: string;
    nameTh: string;
    registeredAddress: AddressInput;
    contractAddress: AddressInput;
    terminals: { nameEn: string; nameTh: string }[];
  }[];
}

export interface CreateMerchantResult {
  merchant: Merchant;
  cashierStaff: Staff[];
  stores: { store: Store; terminals: Terminal[] }[];
}

const MAX_PARTNER_ID_ATTEMPTS = 10;
const PIN_HASH_ROUNDS = 10;

/** Creates a merchant together with its cashier staff, stores (with addresses) and terminals. */
export class CreateMerchantUseCase {
  constructor(
    private readonly merchantRepository: IMerchantRepository,
    private readonly cashierStaffRepository: ICashierStaffRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly runningNumberService: IRunningNumberService,
  ) {}

  public async execute(request: CreateMerchantRequest): Promise<CreateMerchantResult> {
    request.cashierStaff.forEach((staffReq, index) => {
      const policy = validatePinPolicy(staffReq.pin);
      if (policy.status === 'failed') {
        throw ValidationError.ErrInvalidRequest(`cashier_staff.${index}.pin: ${policy.message}`);
      }
    });

    const roleIds = await this.cashierStaffRepository.getRoleIdsByName();
    request.cashierStaff.forEach((staffReq, index) => {
      if (!roleIds.has(staffReq.role)) {
        throw ValidationError.ErrInvalidRequest(`cashier_staff.${index}.role: not found`);
      }
    });

    const resolvedAddresses: { registered: ResolvedAddress; contract: ResolvedAddress }[] = [];
    for (const [index, storeReq] of request.stores.entries()) {
      resolvedAddresses.push({
        registered: await this.resolveAddress(storeReq.registeredAddress, `stores.${index}.registered_address`),
        contract: await this.resolveAddress(storeReq.contractAddress, `stores.${index}.contract_address`),
      });
    }

    const merchantUid = uuidv4();
    const partnerId = await this.generateUniquePartnerId();
    const merchant = new Merchant(merchantUid, partnerId, request.nameEn, request.nameTh);

    const cashierStaff: NewCashierStaff[] = [];
    for (const staffReq of request.cashierStaff) {
      const username = await this.runningNumberService.nextStaffUsername(partnerId);
      const pinHash = await bcrypt.hash(staffReq.pin, PIN_HASH_ROUNDS);
      cashierStaff.push({
        staff: new Staff(uuidv4(), merchantUid, staffReq.fullName, staffReq.role as Staff['role'], username, pinHash, 'ACTIVE'),
        roleId: roleIds.get(staffReq.role)!,
      });
    }

    const stores: NewStore[] = [];
    for (const [index, storeReq] of request.stores.entries()) {
      const storeUid = uuidv4();
      const sid = await this.runningNumberService.nextSid(partnerId);
      const terminals: Terminal[] = [];
      for (const terminalReq of storeReq.terminals) {
        const tid = await this.runningNumberService.nextTid(sid);
        terminals.push(new Terminal(uuidv4(), storeUid, tid, terminalReq.nameEn, terminalReq.nameTh));
      }
      stores.push({
        store: new Store(storeUid, sid, merchantUid, partnerId, storeReq.nameEn, storeReq.nameTh),
        registeredAddress: resolvedAddresses[index].registered,
        contractAddress: resolvedAddresses[index].contract,
        terminals,
      });
    }

    await this.merchantRepository.createWithMembers(merchant, cashierStaff, stores);
    return {
      merchant,
      cashierStaff: cashierStaff.map((s) => s.staff),
      stores: stores.map(({ store, terminals }) => ({ store, terminals })),
    };
  }

  private async resolveAddress(input: AddressInput, path: string): Promise<ResolvedAddress> {
    const result = await this.addressRepository.resolve(input);
    if (!result.ok) throw ValidationError.ErrInvalidRequest(`${path}.${result.field}: ${result.message}`);
    return result.address;
  }

  /** Generates a partner id; if it already exists, generates a new one and retries. */
  private async generateUniquePartnerId(): Promise<string> {
    for (let attempt = 0; attempt < MAX_PARTNER_ID_ATTEMPTS; attempt++) {
      const partnerId = await this.runningNumberService.nextPartnerId();
      if (!(await this.merchantRepository.getByPartnerId(partnerId))) return partnerId;
    }
    throw new Error('Cannot generate a unique partner id');
  }
}
