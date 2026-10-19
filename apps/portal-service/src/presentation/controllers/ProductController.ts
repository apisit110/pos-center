import { Request, Response, NextFunction } from 'express';
import { GetProductsUseCase } from '../../application/usecases/GetProductsUseCase';
import { GetProductDetailUseCase } from '../../application/usecases/GetProductDetailUseCase';
import { GetProductFilterMetadataUseCase } from '../../application/usecases/GetProductFilterMetadataUseCase';
import { CreateProductUseCase } from '../../application/usecases/CreateProductUseCase';
import { BulkCreateProductsUseCase } from '../../application/usecases/BulkCreateProductsUseCase';
import { getProductsQuerySchema } from '../dtos/request/GetProductsQueryDto';
import { createProductSchema } from '../dtos/request/CreateProductRequestDto';
import { bulkCreateProductsSchema } from '../dtos/request/BulkCreateProductsRequestDto';
import { idParamSchema } from '../dtos/request/CommonRequestDto';
import {
  BulkCreateProductsResponseDto,
  ProductMetadataResponseDto,
  toProductResponseDto,
} from '../dtos/response/ProductResponseDto';
import { toPaginatedResponseDto } from '../dtos/response/PaginatedResponseDto';
import { actorOf } from '../middleware/AuthMiddleware';
import { sendOk } from './respond';

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
      const query = getProductsQuerySchema.parse(req.query);

      const result = await this.getProductsUseCase.execute(actorOf(req), {
        page: query.page,
        limit: query.limit,
        barcode: query.barcode,
        name: query.name,
        merchantUid: query.merchant_uid,
        brands: query.brands,
        units: query.units,
        price: query.price,
        storeUid: query.store_uid,
      });
      sendOk(res, toPaginatedResponseDto(result.products, result.total, result.page, result.limit, toProductResponseDto));
    } catch (error) {
      next(error);
    }
  }

  async getMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = await this.getProductFilterMetadataUseCase.execute(actorOf(req));
      sendOk<ProductMetadataResponseDto>(res, metadata);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const product = await this.getProductDetailUseCase.execute(actorOf(req), id);
      sendOk(res, toProductResponseDto(product));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createProductSchema.parse(req.body);
      const product = await this.createProductUseCase.execute(actorOf(req), {
        merchantUid: body.merchant_uid,
        name: body.name,
        barcode: body.barcode,
        basePrice: body.base_price,
        imageUrl: body.image_url,
        brand: body.brand,
        unitName: body.unit_name,
      });
      sendOk(res, toProductResponseDto(product), 201);
    } catch (error) {
      next(error);
    }
  }

  async batchCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { products } = bulkCreateProductsSchema.parse(req.body);

      const result = await this.bulkCreateProductsUseCase.execute(
        actorOf(req),
        products.map(p => ({
          uid: p.uid || undefined,
          merchantUid: p.merchant_uid,
          name: p.name,
          barcode: p.barcode,
          basePrice: p.base_price,
          imageUrl: p.image_url,
          brand: p.brand,
          unitName: p.unit_name,
        }))
      );

      sendOk<BulkCreateProductsResponseDto>(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
