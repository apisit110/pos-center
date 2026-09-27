import { Request, Response, NextFunction } from 'express';
import { GetStoresUseCase } from '../../application/usecases/GetStoresUseCase';
import { GetStoreDetailUseCase } from '../../application/usecases/GetStoreDetailUseCase';
import { GetTerminalsByStoreUseCase } from '../../application/usecases/GetTerminalsByStoreUseCase';
import { getStoresQuerySchema } from '../dtos/request/GetStoresQueryDto';
import { toStoreResponseDto } from '../dtos/response/StoreResponseDto';
import { toTerminalResponseDto } from '../dtos/response/TerminalResponseDto';

export class StoreController {
  constructor(
    private getStoresUseCase: GetStoresUseCase,
    private getStoreDetailUseCase: GetStoreDetailUseCase,
    private getTerminalsByStoreUseCase: GetTerminalsByStoreUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = getStoresQuerySchema.parse(req.query);
      const stores = await this.getStoresUseCase.execute(merchantId);
      res.json(stores.map(toStoreResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: uid } = req.params;
      const store = await this.getStoreDetailUseCase.execute(uid);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(toStoreResponseDto(store));
    } catch (error) {
      next(error);
    }
  }

  async getTerminals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: storeId } = req.params;
      const terminals = await this.getTerminalsByStoreUseCase.execute(storeId);
      res.json(terminals.map(toTerminalResponseDto));
    } catch (error) {
      next(error);
    }
  }
}
