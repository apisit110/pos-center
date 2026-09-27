import { Request, Response, NextFunction } from 'express';
import { GetProductsUseCase } from '../../application/usecases/GetProductsUseCase';
import { GetProductDetailUseCase } from '../../application/usecases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from '../../application/usecases/GetProductFilterMetadataUseCase';
import { CreateProductUseCase } from '../../application/usecases/CreateProductUseCase';
import { BulkCreateProductsUseCase } from '../../application/usecases/BulkCreateProductsUseCase';
import { getProductsQuerySchema } from '../dtos/request/GetProductsQueryDto';
import { createProductSchema } from '../dtos/request/CreateProductRequestDto';
import { bulkCreateProductsSchema } from '../dtos/request/BulkCreateProductsRequestDto';
import { toProductResponseDto } from '../dtos/response/ProductResponseDto';
import { PaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';

export class ProductController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductDetailUseCase: GetProductDetailUseCase,
    private getProductFilterMetadataUseCase: GetProductFilterMetadataUseCase,
    private createProductUseCase: CreateProductUseCase,
    private bulkCreateProductsUseCase: BulkCreateProductsUseCase
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, barcode, name, merchantId, brands, price, units, storeId } =
        getProductsQuerySchema.parse(req.query);

      const filters = {
        barcode,
        name,
        merchantId,
        brands,
        price,
        units,
        storeId,
      };

      const result = await this.getProductsUseCase.execute(page, limit, filters);
      const response: PaginatedResponseDto<ReturnType<typeof toProductResponseDto>> = {
        items: result.products.map(toProductResponseDto),
        total: result.total,
        page,
        limit,
      };
      res.json(response);
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
      res.json(toProductResponseDto(product));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, name, barcode, basePrice, imageUrl, brand, unitName } = createProductSchema.parse(
        req.body
      );
      const product = await this.createProductUseCase.execute({
        merchantId,
        name,
        sku: barcode || '',
        barcode: barcode || '',
        basePrice: Number(basePrice),
        imageUrl: imageUrl ? (Array.isArray(imageUrl) ? imageUrl : [imageUrl]) : [],
        brand: brand || '',
        unitName: unitName || '',
      });
      res.status(201).json(toProductResponseDto(product));
    } catch (error) {
      next(error);
    }
  }

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { products } = bulkCreateProductsSchema.parse(req.body);

      const result = await this.bulkCreateProductsUseCase.execute(
        products.map(p => ({
          uid: p.uid,
          merchantId: p.merchantId,
          name: p.name,
          barcode: p.barcode || '',
          basePrice: Number(p.basePrice),
          imageUrl: p.imageUrl || [],
          brand: p.brand || '',
          unitName: p.unitName || '',
        }))
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
