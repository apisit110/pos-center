import axios from 'axios';
import { Product } from '../../domain/entities/Product';
import { ProductRepository, ProductFilter } from '../../application/repositories/ProductRepository';

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
        'M-123', // Mock merchantId
        item.name_th || item.name_en || 'Unnamed Product',
        item.uid, // Mock SKU
        item.barcode,
        item.base_price,
        (item.image_url && item.image_url.length > 0) ? item.image_url[0].replace('assets/products/', 'products/') : '',
        item.brand_th || item.brand_en || 'No Brand'
      ));
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load product master data:', error);
      this.products = [];
    }
  }

  public async getProducts(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }> {
    await this.initialize();
    
    let filteredProducts = this.products;

    if (filters) {
      if (filters.barcode) {
        filteredProducts = filteredProducts.filter(p => 
          p.barcode.toLowerCase().includes(filters.barcode!.toLowerCase())
        );
      }
      if (filters.name) {
        const nameFilter = filters.name.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(nameFilter)
        );
      }
      if (filters.brands && filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          filters.brands!.includes(p.brand)
        );
      }
      if (filters.price !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.basePrice <= filters.price!);
      }
      if (filters.units && filters.units.length > 0) {
        // unit is no longer in Product entity, it's in StoreProduct in the new model
        // For now, we'll skip unit filtering or assume it's part of the mock data if we had it
      }
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      products: filteredProducts.slice(start, end),
      total: filteredProducts.length
    };
  }

  public async getProductById(id: string): Promise<Product | null> {
    await this.initialize();
    return this.products.find(p => p.id === id) || null;
  }

  public async getFilterMetadata(): Promise<{ brands: string[], units: string[] }> {
    await this.initialize();
    const brands = Array.from(new Set(this.products.map(p => p.brand).filter(b => b !== 'No Brand')));
    const units: string[] = []; // Unit is in StoreProduct now
    return { brands, units };
  }
}
