import { Product } from '../../domain/entities/Product';

export interface ProductFilter {
  barcode?: string;
  name?: string;
  merchantUid?: string;
  brands?: string[];
  units?: string[];
  /** base_price <= price */
  price?: number;
  /** only products listed in this store */
  storeUid?: string;
}

export interface BarcodeOwner {
  barcode: string;
  productUid: string;
}

export interface ProductOwner {
  productUid: string;
  merchantUid: string;
}

export interface IProductRepository {
  getById(id: string): Promise<Product | null>;
  getByMerchantId(merchantId: string): Promise<Product[]>;
  /** Ordered by internal id descending (newest first). */
  findAll(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }>;
  /** Products of the merchant (by merchant uid) that already use one of the barcodes. */
  findBarcodeOwners(merchantUid: string, barcodes: string[]): Promise<BarcodeOwner[]>;
  /** Merchant uid that owns each of the existing products (by product uid). Unknown uids are omitted. */
  findOwnersByUids(productUids: string[]): Promise<ProductOwner[]>;
  save(product: Product): Promise<void>;
  bulkSave(products: Product[]): Promise<void>;
  delete(id: string): Promise<void>;
  /** Distinct, ascending, non-empty brands and units. Limited to one merchant when `merchantUid` is given. */
  getMetadata(merchantUid?: string): Promise<{ brands: string[], units: string[] }>;
}
