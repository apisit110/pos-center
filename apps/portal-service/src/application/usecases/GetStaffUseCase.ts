import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { ICashierStaffRepository, StaffFilter } from '../../domain/repositories/ICashierStaffRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { Staff } from '../../domain/entities/Staff';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';
import { toRangeEnd, toRangeStart } from '../utils/dateRange';

export interface GetStaffInput {
  page: number;
  limit: number;
  merchantUid?: string;
  role?: string;
  username?: string;
  status?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetStaffOutput {
  staff: Staff[];
  total: number;
  page: number;
  limit: number;
}

/** Lists cashier staff (the staff of the merchants). */
export class GetStaffUseCase {
  constructor(
    private cashierStaffRepository: ICashierStaffRepository,
    private staffRepository: IStaffRepository,
    private merchantRepository: IMerchantRepository,
  ) {}

  async execute(actor: Actor, input: GetStaffInput): Promise<GetStaffOutput> {
    const empty: GetStaffOutput = { staff: [], total: 0, page: input.page, limit: input.limit };
    let merchantUid = input.merchantUid;

    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid) return empty;
      if (merchantUid && merchantUid !== ownMerchantUid) throw ServiceError.ErrForbidden();
      merchantUid = ownMerchantUid;
    }

    if (merchantUid) {
      const merchant = await this.merchantRepository.getById(merchantUid);
      if (!merchant) return empty;
    }

    const filters: StaffFilter = {
      merchantUid,
      role: input.role,
      username: input.username,
      status: input.status,
      query: input.query,
      startDate: toRangeStart(input.startDate),
      endDate: toRangeEnd(input.endDate),
    };
    const { staff, total } = await this.cashierStaffRepository.getStaff(input.page, input.limit, filters);
    return { staff, total, page: input.page, limit: input.limit };
  }
}
