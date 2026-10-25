import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ISyncTokenService, SyncTokenClaims } from '../../domain/services/ISyncTokenService'
import { SyncError } from '../../application/errors/SyncError'

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      /** terminal of the sync token, set by syncTokenMiddleware */
      syncAuth: SyncTokenClaims
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const BEARER_PREFIX = 'Bearer '

/** Verifies `Authorization: Bearer <access_token>` (from POST /api/v1/sync/auth/token) and sets `req.syncAuth`. */
export const syncTokenMiddleware = (tokenService: ISyncTokenService): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization
      if (!header?.startsWith(BEARER_PREFIX)) throw SyncError.invalidToken()
      req.syncAuth = tokenService.verify(header.slice(BEARER_PREFIX.length))
      next()
    } catch (error) {
      next(error)
    }
  }

export interface SyncScope {
  partnerIds?: string[]
  sids?: string[]
  /** null terminal ids are skipped */
  tids?: (string | null)[]
}

/** Throws 403 when a merchant / store / terminal in the request body is not the one of the token. */
export const assertTokenScope = (auth: SyncTokenClaims, { partnerIds = [], sids = [], tids = [] }: SyncScope): void => {
  if (
    partnerIds.some((partnerId) => partnerId !== auth.partnerId) ||
    sids.some((sid) => sid !== auth.sid) ||
    tids.some((tid) => tid !== null && tid !== auth.tid)
  ) {
    throw SyncError.tokenScopeMismatch()
  }
}
