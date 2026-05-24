'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { GetProductsUseCase } from '../../../application/use-cases/GetProductsUseCase';
import { GetProductFilterMetadataUseCase } from '../../../application/use-cases/GetProductFilterMetadataUseCase';
import { GetMerchantsUseCase } from '../../../application/use-cases/GetMerchantsUseCase';
import { GetStoresUseCase } from '../../../application/use-cases/GetStoresUseCase';
import { ApiProductRepository } from '../../../infrastructure/repositories/ApiProductRepository';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductFilter } from '../../../application/repositories/ProductRepository';
import { DataTable, FilterBar, TextFilter, SelectFilter, ClearFilterButton, InputField, Button } from '@apisit110/pos-ui';
import { useRouter } from 'next/navigation';

type LocalProductFilter = {
  barcode: string;
  name: string;
  brand: string;
  price: number | undefined;
  unit: string;
  merchantId: string | undefined;
  storeId: string | undefined;
};

const toProductFilter = (f: LocalProductFilter): ProductFilter => ({
  barcode: f.barcode || undefined,
  name: f.name || undefined,
  brands: f.brand ? [f.brand] : undefined,
  price: f.price,
  units: f.unit ? [f.unit] : undefined,
  merchantId: f.merchantId,
  storeId: f.storeId,
});

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;


export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [filters, setFilters] = useState<LocalProductFilter>({
    barcode: '',
    name: '',
    brand: '',
    price: undefined,
    unit: '',
    merchantId: undefined,
    storeId: undefined,
  });
  
  // Metadata for filters
  const [metadata, setMetadata] = useState<{ brands: string[], units: string[] }>({
    brands: [],
    units: []
  });

  const [merchants, setMerchants] = useState<{ value: string, label: string }[]>([]);
  const [stores, setStores] = useState<{ value: string, label: string }[]>([]);

  const merchantMap = useMemo(() => {
    const map: Record<string, string> = {};
    merchants.forEach(m => {
      map[m.value] = m.label;
    });
    return map;
  }, [merchants]);

  const fetchProducts = useCallback(async (activeFilters: LocalProductFilter) => {
    const repository = new ApiProductRepository();
    const useCase = new GetProductsUseCase(repository);
    const result = await useCase.execute(page, limit, toProductFilter(activeFilters));
    setProducts(result.products);
    setTotal(result.total);
  }, [page, limit]);

  useEffect(() => {
    const fetchMetadata = async () => {
      const repository = new ApiProductRepository();
      const useCase = new GetProductFilterMetadataUseCase(repository);
      const data = await useCase.execute();
      setMetadata(data);

      const merchantRepo = new ApiMerchantRepository();
      const merchantUC = new GetMerchantsUseCase(merchantRepo);
      const merchantData = await merchantUC.execute();
      setMerchants(merchantData.map(m => ({ value: m.uid, label: m.name })));

      const storeRepo = new ApiStoreRepository();
      const storeUC = new GetStoresUseCase(storeRepo);
      const storeData = await storeUC.execute();
      setStores(storeData.map(s => ({ value: s.uid, label: s.name })));
    };
    fetchMetadata();
  }, []);

  const handleMerchantChange = async (selected: { value: string } | null) => {
    const merchantId = selected?.value || undefined;
    setFilters(prev => ({ ...prev, merchantId, storeId: undefined }));

    const storeRepo = new ApiStoreRepository();
    const storeUC = new GetStoresUseCase(storeRepo);
    const storeData = await storeUC.execute(merchantId);
    setStores(storeData.map(s => ({ value: s.uid, label: s.name })));
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [page, limit, fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts(filters);
  };

  const handleClear = () => {
    const clearedFilters: LocalProductFilter = {
      barcode: '',
      name: '',
      brand: '',
      price: undefined,
      unit: '',
      merchantId: undefined,
      storeId: undefined,
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchProducts(clearedFilters);
  };

  const columns = [
    { header: 'Barcode', key: 'barcode', width: '150px' },
    { header: 'Name', key: 'name' },
    { header: 'Brand', key: 'brand' },
    { header: 'Unit', key: 'unitName' },
    { header: 'Merchant', key: 'merchant', render: (p: Product) => merchantMap[p.merchantId] || p.mid },
    { header: 'Price', key: 'price', render: (p: Product) => `${p.basePrice.toLocaleString()} ฿` },
  ];

  const brandOptions = metadata.brands.map(b => ({ value: b, label: b }));
  const unitOptions = metadata.units.map(u => ({ value: u, label: u }));

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
        <Button style={{ width: 'auto' }} onClick={() => router.push('/products/new')}>+ Add Product</Button>
      </div>
      <FilterBar>
        <TextFilter
          label="Barcode"
          placeholder="Search barcode..."
          value={filters.barcode}
          onChange={(value) => setFilters({ ...filters, barcode: value })}
        />

        <TextFilter
          label="Product Name"
          placeholder="Search name..."
          value={filters.name}
          onChange={(value) => setFilters({ ...filters, name: value })}
        />

        <InputField
          label="Max Price"
          type="number"
          placeholder="Max price..."
          value={filters.price === undefined ? '' : filters.price}
          onChange={(e) => setFilters({ ...filters, price: e.target.value ? Number(e.target.value) : undefined })}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <SelectFilter
          label="Brand"
          value={filters.brand}
          onChange={(value) => setFilters({ ...filters, brand: value })}
          options={brandOptions}
          placeholder="All Brands"
        />

        <SelectFilter
          label="Unit"
          value={filters.unit}
          onChange={(value) => setFilters({ ...filters, unit: value })}
          options={unitOptions}
          placeholder="All Units"
        />

        <SelectFilter
          label="Merchant"
          value={filters.merchantId ?? ''}
          onChange={(value) => handleMerchantChange(value ? { value } : null)}
          options={merchants}
          placeholder="All Merchants"
        />

        <SelectFilter
          label="Store"
          value={filters.storeId ?? ''}
          onChange={(value) => setFilters({ ...filters, storeId: value || undefined })}
          options={stores}
          placeholder="All Stores"
          disabled={!filters.merchantId && merchants.length > 0}
        />

        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>Clear</ClearFilterButton>
          <Button style={{ width: 'auto' }} onClick={handleSearch}>Search</Button>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={products}
        onRowClick={(product) => router.push(`/products/${product.id}`)}
        totalItems={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />
    </PageContainer>
  );
}
