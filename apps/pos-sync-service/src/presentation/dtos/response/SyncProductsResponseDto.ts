import { Product } from '../../../domain/entities/Product';

export interface SyncProductResponseDto {
  id: string;
  merchantId: string;
  storeId: string;
  name: string;
  nameEn: string;
  nameTh: string;
  sku: string;
  barcode: string;
  basePrice: number;
  imageUrl: string;
  brand: string;
  syncVersion: number;
}

export interface SyncProductsSuccessResponseDto {
  message: string;
  products: SyncProductResponseDto[];
  count: number;
}

export interface SyncProductsFailureResponseDto {
  message: string;
}

export const buildSyncProductsSuccessResponse = (products: Product[]): SyncProductsSuccessResponseDto => ({
  message: 'Sync completed successfully',
  products: products.map(product => ({
    id: product.id,
    merchantId: product.merchantId,
    storeId: product.storeId,
    name: product.name,
    nameEn: product.nameEn,
    nameTh: product.nameTh,
    sku: product.sku,
    barcode: product.barcode,
    basePrice: product.basePrice,
    imageUrl: product.imageUrl,
    brand: product.brand,
    syncVersion: product.syncVersion,
  })),
  count: products.length,
});

export const buildSyncProductsFailureResponse = (): SyncProductsFailureResponseDto => ({
  message: 'Sync failed',
});
