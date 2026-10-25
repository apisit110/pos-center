import { Request, Response, NextFunction } from 'express';
import { IssueSyncTokenUseCase } from '../../application/usecases/IssueSyncTokenUseCase';
import { issueSyncTokenHeadersSchema, issueSyncTokenRequestSchema } from '../dtos/request/IssueSyncTokenRequestDto';
import { buildIssueSyncTokenResponse } from '../dtos/response/IssueSyncTokenResponseDto';

export class SyncAuthController {
  constructor(private readonly issueSyncTokenUseCase: IssueSyncTokenUseCase) {}

  async issueToken(req: Request, res: Response, next: NextFunction) {
    try {
      const headers = issueSyncTokenHeadersSchema.parse(req.headers);
      const { tid } = issueSyncTokenRequestSchema.parse(req.body);

      console.log(`[pos-sync-service] Issuing sync token for partner: ${headers['x-partner-id']}, terminal: ${tid}`);

      const token = await this.issueSyncTokenUseCase.execute({
        partnerId: headers['x-partner-id'],
        clientId: headers['x-client-id'],
        clientSecret: headers['x-client-secret'],
      }, tid);

      // tokens must not be cached by proxies
      res.set('Cache-Control', 'no-store');
      return res.status(200).json(buildIssueSyncTokenResponse(token));
    } catch (error) {
      next(error);
    }
  }
}
