import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { SUPER_ADMIN_ROLE } from '../../domain/constants/roles';
import { ServiceError } from '../errors/ServiceError';

/** The authenticated caller, taken from the access token. */
export interface Actor {
  uid: string;
  role: string;
}

export const isProductOwner = (actor: Actor): boolean => actor.role === SUPER_ADMIN_ROLE;

/** Merchant uid of the caller, or null when the staff (or its merchant) cannot be found. */
export function findOwnMerchantUid(staffRepository: IStaffRepository, actor: Actor): Promise<string | null> {
  return staffRepository.getMerchantUidByStaffId(actor.uid);
}

/** Throws ErrForbidden unless the caller is PRODUCT_OWNER or belongs to `merchantUid`. */
export async function assertMerchantAccess(
  staffRepository: IStaffRepository,
  actor: Actor,
  merchantUid: string,
): Promise<void> {
  if (isProductOwner(actor)) return;
  const own = await findOwnMerchantUid(staffRepository, actor);
  if (!own || own !== merchantUid) throw ServiceError.ErrForbidden();
}
