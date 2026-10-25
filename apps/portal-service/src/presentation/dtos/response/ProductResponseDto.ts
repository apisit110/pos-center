import { Brand, Product } from '../../../domain/entities/Product';

export interface BrandResponseDto {
  uid: string;
  name_en: string;
  name_th: string;
}

export interface ProductResponseDto {
  uid: string;
  merchant_uid: string;
  partner_id: string;
  name_en: string;
  name_th: string;
  sku: string;
  barcode: string;
  base_price: number;
  image_url: string;
  brand: BrandResponseDto | null;
  unit_name: string;
}

export const toBrandResponseDto = (brand: Brand): BrandResponseDto => ({
  uid: brand.uid,
  name_en: brand.nameEn,
  name_th: brand.nameTh,
});

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    uid: product.id,
    merchant_uid: product.merchantId,
    partner_id: product.partnerId,
    name_en: product.nameEn,
    name_th: product.nameTh,
    sku: product.sku,
    barcode: product.barcode,
    base_price: product.basePrice,
    image_url: product.imageUrl,
    brand: product.brand && toBrandResponseDto(product.brand),
    unit_name: product.unitName,
  };
}

export interface ProductMetadataResponseDto {
  brands: BrandResponseDto[];
  units: string[];
}

export interface BulkCreateProductsResponseDto {
  created: number;
  errors: Array<{ index: number; name_en: string; message: string }>;
}
