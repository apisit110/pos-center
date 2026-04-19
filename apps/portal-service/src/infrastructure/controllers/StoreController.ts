import { Request, Response } from 'express';
import { GetStoresUseCase } from '../../application/use-cases/GetStoresUseCase';
import { GetStoreDetailUseCase } from '../../application/use-cases/GetStoreDetailUseCase';

export class StoreController {
  constructor(
    private getStoresUseCase: GetStoresUseCase,
    private getStoreDetailUseCase: GetStoreDetailUseCase
  ) {}

  async getAll(req: Request, res: Response) {
    try {
      const stores = await this.getStoresUseCase.execute();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const store = await this.getStoreDetailUseCase.execute(id);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
