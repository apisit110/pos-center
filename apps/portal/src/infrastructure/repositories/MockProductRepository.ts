import axios from 'axios';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../application/repositories/ProductRepository';

export class MockProductRepository implements ProductRepository {
  private products: Product[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await axios.get('/constants/product_master.json');
      const data = response.data;
      this.products = data.map((item: any) => new Product(
        item.uid,
        item.name_en,
        item.name_th,
        item.brand_en,
        item.brand_th,
        item.base_price,
        item.unit_name,
        item.barcode,
        (item.image_url || []).map((url: string) => url.replace('assets/products/', 'products/'))
      ));
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load product master data:', error);
      this.products = [];
    }
  }

  public async getProducts(page: number, limit: number): Promise<{ products: Product[], total: number }> {
    await this.initialize();
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      products: this.products.slice(start, end),
      total: this.products.length
    };
  }

  public async getProductById(id: string): Promise<Product | null> {
    await this.initialize();
    return this.products.find(p => p.uid === id) || null;
  }
}
