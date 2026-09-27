import { Product } from '../../../domain/entities/Product';

export interface SyncProductsSuccessResponseDto {
  message: string;
  products: Product[];
  count: number;
}

export interface SyncProductsFailureResponseDto {
  message: string;
}

export const buildSyncProductsSuccessResponse = (products: Product[]): SyncProductsSuccessResponseDto => ({
  message: 'Sync completed successfully',
  products,
  count: products.length,
});

export const buildSyncProductsFailureResponse = (): SyncProductsFailureResponseDto => ({
  message: 'Sync failed',
});
