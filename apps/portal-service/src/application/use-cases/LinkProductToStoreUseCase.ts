import { StoreProduct } from '../../domain/entities/StoreProduct';
import { IStoreProductRepository } from '../repositories/IStoreProductRepository';
import { v4 as uuidv4 } from 'uuid';

export interface LinkProductToStoreRequest {
  storeId: string;
  productId: string;
  stock: number;
  price: number;
  unit: string;
}

export class LinkProductToStoreUseCase {
  constructor(private readonly storeProductRepository: IStoreProductRepository) {}

  public async execute(request: LinkProductToStoreRequest): Promise<StoreProduct> {
    const id = uuidv4();
    
    const storeProduct = new StoreProduct(
      id,
      request.storeId,
      request.productId,
      request.stock,
      request.price,
      request.unit
    );
    
    await this.storeProductRepository.save(storeProduct);
    
    return storeProduct;
  }
}
