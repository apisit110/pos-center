import { Request, Response, NextFunction } from 'express';
import { BatchUpsertBrandsUseCase } from '../../application/usecases/BatchUpsertBrandsUseCase';
import { batchUpsertBrandsSchema } from '../dtos/request/BatchUpsertBrandsRequestDto';
import { sendOk } from './respond';

export class BrandController {
  constructor(private readonly batchUpsertBrandsUseCase: BatchUpsertBrandsUseCase) {}

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { brands } = batchUpsertBrandsSchema.parse(req.body);
      const result = await this.batchUpsertBrandsUseCase.execute(
        brands.map((b) => ({ uid: b.uid, nameEn: b.name_en, nameTh: b.name_th })),
      );
      sendOk(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
