import { Request, Response } from 'express';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductDetailUseCase } from '../../application/use-cases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from '../../application/use-cases/GetProductFilterMetadataUseCase';

export class ProductController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductDetailUseCase: GetProductDetailUseCase,
    private getProductFilterMetadataUseCase: GetProductFilterMetadataUseCase
  ) {}

  async getAll(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      
      // Extract filters
      const { barcode, name, merchantId, brands } = req.query;
      const filters = {
        barcode: barcode as string,
        name: name as string,
        merchantId: merchantId as string,
        brands: brands ? (Array.isArray(brands) ? brands : [brands]) as string[] : []
      };

      const result = await this.getProductsUseCase.execute(page, limit, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMetadata(req: Request, res: Response) {
    try {
      const metadata = await this.getProductFilterMetadataUseCase.execute();
      res.json(metadata);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await this.getProductDetailUseCase.execute(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
