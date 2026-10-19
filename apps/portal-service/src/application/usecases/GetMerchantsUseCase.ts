import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Merchant } from '../../domain/entities/Merchant';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';

export interface GetMerchantsInput {
  page: number;
  limit: number;
  mid?: string;
  name?: string;
}

export interface GetMerchantsOutput {
  merchants: Merchant[];
  total: number;
  page: number;
  limit: number;
}

export class GetMerchantsUseCase {
  constructor(
    private merchantRepository: IMerchantRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, input: GetMerchantsInput): Promise<GetMerchantsOutput> {
    if (!isProductOwner(actor)) {
      // other roles only ever see their own merchant: page, limit, mid and name are ignored
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      const ownMerchant = ownMerchantUid ? await this.merchantRepository.getById(ownMerchantUid) : null;
      const merchants = ownMerchant ? [ownMerchant] : [];
      return { merchants, total: merchants.length, page: 1, limit: merchants.length };
    }

    const { merchants, total } = await this.merchantRepository.findAll(input.page, input.limit, {
      mid: input.mid,
      name: input.name,
    });
    return { merchants, total, page: input.page, limit: input.limit };
  }
}
