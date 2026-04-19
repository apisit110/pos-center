import { Request, Response } from 'express';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductDetailUseCase } from '../../application/use-cases/GetProductDetailUseCase';

export class ProductController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductDetailUseCase: GetProductDetailUseCase
  ) {}

  async getAll(req: Request, res: Response) {
    try {
      const products = await this.getProductsUseCase.execute();
      res.json(products);
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
