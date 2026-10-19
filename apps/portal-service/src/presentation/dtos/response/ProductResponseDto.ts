import { Product } from '../../../domain/entities/Product';

export interface ProductResponseDto {
  uid: string;
  merchant_uid: string;
  mid: string;
  name: string;
  sku: string;
  barcode: string;
  base_price: number;
  image_url: string[];
  brand: string;
  unit_name: string;
}

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    uid: product.id,
    merchant_uid: product.merchantId,
    mid: product.mid,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    base_price: product.basePrice,
    image_url: product.imageUrl,
    brand: product.brand,
    unit_name: product.unitName,
  };
}

export interface ProductMetadataResponseDto {
  brands: string[];
  units: string[];
}

export interface BulkCreateProductsResponseDto {
  created: number;
  errors: Array<{ index: number; name: string; message: string }>;
}
