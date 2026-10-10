import { Request, Response, NextFunction } from 'express';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { SUPER_ADMIN_ROLE } from '../../domain/constants/roles';

/**
 * Restricts access to the merchant identified by `extractMerchantUid(req)` to
 * SUPER_ADMIN_ROLE staff or staff belonging to that same merchant. Skips the
 * check entirely when extractMerchantUid returns undefined (e.g. an optional
 * query filter was not supplied).
 */
export function requireMerchantOwnership(
  staffRepository: IStaffRepository,
  extractMerchantUid: (req: Request) => string | undefined
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
      if (req.auth.role === SUPER_ADMIN_ROLE) return next();

      const targetMerchantUid = extractMerchantUid(req);
      if (!targetMerchantUid) return next();

      const ownMerchantUid = await staffRepository.getMerchantUidByStaffId(req.auth.uid);
      if (!ownMerchantUid || ownMerchantUid !== targetMerchantUid) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
