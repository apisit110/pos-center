import { Request, Response, NextFunction } from 'express';
import { GetStoresUseCase } from '../../application/usecases/GetStoresUseCase';
import { GetStoreDetailUseCase } from '../../application/usecases/GetStoreDetailUseCase';
import { GetTerminalsByStoreUseCase } from '../../application/usecases/GetTerminalsByStoreUseCase';
import { getStoresQuerySchema } from '../dtos/request/GetStoresQueryDto';
import { idParamSchema } from '../dtos/request/CommonRequestDto';
import { toStoreResponseDto } from '../dtos/response/StoreResponseDto';
import { toTerminalResponseDto } from '../dtos/response/TerminalResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

export class StoreController {
  constructor(
    private getStoresUseCase: GetStoresUseCase,
    private getStoreDetailUseCase: GetStoreDetailUseCase,
    private getTerminalsByStoreUseCase: GetTerminalsByStoreUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchant_uid } = getStoresQuerySchema.parse(req.query);
      const stores = await this.getStoresUseCase.execute(actorOf(req), merchant_uid);
      sendOk(res, stores.map(toStoreResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const store = await this.getStoreDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toStoreResponseDto(store));
    } catch (error) {
      next(error);
    }
  }

  async getTerminals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const terminals = await this.getTerminalsByStoreUseCase.execute(actorOf(req), id);
      sendOk(res, terminals.map(toTerminalResponseDto));
    } catch (error) {
      next(error);
    }
  }
}
