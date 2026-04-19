import { Request, Response, NextFunction } from 'express';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductDetailUseCase } from '../../application/use-cases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from '../../application/use-cases/GetProductFilterMetadataUseCase';

export class ProductController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductDetailUseCase: GetProductDetailUseCase,
    private getProductFilterMetadataUseCase: GetProductFilterMetadataUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      
      // Extract filters
      const { barcode, name, merchantId, brands, price, units, storeId } = req.query;
      const filters = {
        barcode: barcode as string,
        name: name as string,
        merchantId: merchantId as string,
        brands: brands ? (Array.isArray(brands) ? brands : [brands]) as string[] : [],
        price: price ? Number(price) : undefined,
        units: units ? (Array.isArray(units) ? units : [units]) as string[] : [],
        storeId: storeId as string
      };

      const result = await this.getProductsUseCase.execute(page, limit, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = await this.getProductFilterMetadataUseCase.execute();
      res.json(metadata);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await this.getProductDetailUseCase.execute(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
}
