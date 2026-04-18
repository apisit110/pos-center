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
          p.nameEn?.toLowerCase().includes(nameFilter) || 
          p.nameTh.toLowerCase().includes(nameFilter)
        );
      }
      if (filters.brands && filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          (p.brandEn && filters.brands!.includes(p.brandEn)) || 
          (p.brandTh && filters.brands!.includes(p.brandTh))
        );
      }
      if (filters.price !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.basePrice <= filters.price!);
      }
      if (filters.units && filters.units.length > 0) {
        filteredProducts = filteredProducts.filter(p => filters.units!.includes(p.unitName));
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
    return this.products.find(p => p.uid === id) || null;
  }

  public async getFilterMetadata(): Promise<{ brands: string[], units: string[] }> {
    await this.initialize();
    const brands = Array.from(new Set(this.products.map(p => p.brand).filter(b => b !== 'No Brand')));
    const units = Array.from(new Set(this.products.map(p => p.unitName)));
    return { brands, units };
  }
}
