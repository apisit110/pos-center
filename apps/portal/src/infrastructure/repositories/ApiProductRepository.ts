import { Product } from '../../domain/entities/Product';
import { ProductRepository, ProductFilter, CreateProductRequest } from '../../application/repositories/ProductRepository';
import ApiClient from '../api/ApiClient';

export class ApiProductRepository implements ProductRepository {
  public async getProducts(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }> {
    const params: any = { page, limit, ...filters };
    
    // Handle multi-select filters (axios by default might not format arrays the way backend expects, 
    // but we can adjust if needed)
    const response = await ApiClient.get('/products', { params });
    const { products, total } = response.data;
    
    return {
      products: products.map((p: any) => new Product(
        p.id,
        p.merchantId,
        p.mid,
        p.name,
        p.sku,
        p.barcode,
        p.basePrice,
        p.imageUrl,
        p.brand,
        p.unitName
      )),
      total
    };
  }

  public async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await ApiClient.get(`/products/${id}`);
      const p = response.data;
      return new Product(
        p.id,
        p.merchantId,
        p.mid,
        p.name,
        p.sku,
        p.barcode,
        p.basePrice,
        p.imageUrl,
        p.brand,
        p.unitName
      );
    } catch (error) {
      return null;
    }
  }

  public async getFilterMetadata(): Promise<{ brands: string[], units: string[] }> {
    const response = await ApiClient.get('/products/metadata');
    return response.data;
  }

  public async createProduct(request: CreateProductRequest): Promise<Product> {
    const response = await ApiClient.post('/products', request);
    const p = response.data;
    return new Product(
      p.id,
      p.merchantId,
      p.mid,
      p.name,
      p.sku,
      p.barcode,
      p.basePrice,
      p.imageUrl,
      p.brand,
      p.unitName
    );
  }

  public async createProducts(requests: CreateProductRequest[]): Promise<{ created: number; errors: string[] }> {
    const response = await ApiClient.post('/products/batch', { products: requests });
    return response.data;
  }
}

