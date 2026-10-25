import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';
import { ValidationError } from '../errors/ValidationError';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
  merchantUid: string;
  nameEn: string;
  nameTh: string;
  barcode?: string;
  basePrice: number;
  imageUrl?: string;
  brandUid?: string;
  unitName?: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly merchantRepository: IMerchantRepository,
    private readonly staffRepository: IStaffRepository,
  ) {}

  public async execute(actor: Actor, request: CreateProductRequest): Promise<Product> {
    await assertMerchantAccess(this.staffRepository, actor, request.merchantUid);

    const merchant = await this.merchantRepository.getById(request.merchantUid);
    if (!merchant) throw ServiceError.ErrMerchantNotFound();

    let brand = null;
    if (request.brandUid) {
      [brand = null] = await this.productRepository.findBrandsByUids([request.brandUid]);
      if (!brand) throw ValidationError.ErrInvalidRequest('brand_uid: not found');
    }

    const uid = uuidv4();
    const barcode = request.barcode || '';

    if (barcode) {
      const owners = await this.productRepository.findBarcodeOwners(request.merchantUid, [barcode]);
      if (owners.length > 0) throw ServiceError.ErrProductBarcodeDuplicate();
    }

    const product = new Product(
      uid,
      request.merchantUid,
      merchant.partnerId,
      request.nameEn,
      request.nameTh,
      barcode, // sku = barcode
      barcode,
      request.basePrice,
      request.imageUrl ?? '',
      brand,
      request.unitName ?? '',
    );

    await this.productRepository.save(product);
    return product;
  }
}
