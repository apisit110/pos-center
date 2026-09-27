import { Product } from '../../../domain/entities/Product';

export interface ProductResponseDto {
  id: string;
  merchantId: string;
  mid: string;
  name: string;
  sku: string;
  barcode: string;
  basePrice: number;
  imageUrl: string | string[];
  brand: string;
  unitName: string;
}

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    merchantId: product.merchantId,
    mid: product.mid,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    basePrice: product.basePrice,
    imageUrl: product.imageUrl,
    brand: product.brand,
    unitName: product.unitName,
  };
}
