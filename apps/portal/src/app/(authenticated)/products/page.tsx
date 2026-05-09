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
import { DataTable } from '../../../presentation/components/DataTable';
import { Pagination } from '../../../presentation/components/Pagination';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
`;

const Input = styled.input`
  margin-bottom: 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  background: rgba(15, 23, 42, 0.5);
  &:focus {
    outline: 2px solid var(--primary);
    border-color: transparent;
  }
`;

const NativeSelect = styled.select`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  color: white;
  font-size: 0.9rem;
  &:focus {
    outline: 2px solid var(--primary);
    border-color: transparent;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'secondary' | 'primary' }>`
  width: auto;
  min-width: 120px;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)'};
  color: white;
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--border)' : 'none'};
  
  &:hover {
    background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary-hover)'};
  }
`;



const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'var(--border)',
    borderRadius: '0.5rem',
    minHeight: '42px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'var(--primary)',
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    zIndex: 20
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    '&:active': {
      background: 'var(--primary)',
    }
  }),
  multiValue: (base: any) => ({
    ...base,
    background: 'var(--primary)',
    borderRadius: '4px',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'white',
    fontSize: '0.8rem',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'white',
    '&:hover': {
      background: 'var(--primary-hover)',
      color: 'white',
    }
  }),
  input: (base: any) => ({
    ...base,
    color: 'white',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--text-sub)',
    fontSize: '0.9rem'
  })
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<ProductFilter>({
    barcode: '',
    name: '',
    brands: [],
    price: undefined,
    units: [],
    merchantId: undefined,
    storeId: undefined
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

  const fetchProducts = useCallback(async (activeFilters: ProductFilter) => {
    const repository = new ApiProductRepository();
    const useCase = new GetProductsUseCase(repository);
    const result = await useCase.execute(page, limit, activeFilters);
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

  const handleMerchantChange = async (selected: any) => {
    const merchantId = selected ? selected.value : undefined;
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
    const clearedFilters = {
      barcode: '',
      name: '',
      brands: [],
      price: undefined,
      units: [],
      merchantId: undefined,
      storeId: undefined
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchProducts(clearedFilters);
  };

  const columns = [
    { header: 'Barcode', accessor: 'barcode' as const, width: '150px' },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Brand', accessor: 'brand' as const },
    { header: 'Unit', accessor: 'unitName' as const },
    { 
      header: 'Merchant', 
      accessor: (p: Product) => merchantMap[p.merchantId] || p.mid 
    },
    { 
      header: 'Price', 
      accessor: (p: Product) => `${p.basePrice.toLocaleString()} ฿` 
    },
  ];

  const brandOptions = metadata.brands.map(b => ({ value: b, label: b }));
  const unitOptions = metadata.units.map(u => ({ value: u, label: u }));

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
        <ActionButton onClick={() => router.push('/products/new')}>+ Add Product</ActionButton>
      </div>
      <FilterSection>
        <FormGroup>
          <Label>Barcode</Label>
          <Input 
            placeholder="Search barcode..." 
            value={filters.barcode}
            onChange={(e) => setFilters({ ...filters, barcode: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Product Name</Label>
          <Input 
            placeholder="Search name..." 
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>

        <FormGroup>
          <Label>Max Price</Label>
          <Input 
            type="number"
            placeholder="Max price..." 
            value={filters.price === undefined ? '' : filters.price}
            onChange={(e) => setFilters({ ...filters, price: e.target.value ? Number(e.target.value) : undefined })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>

        <FormGroup>
          <Label>Brand</Label>
          <Select
            instanceId="brand-select"
            isMulti
            options={brandOptions}
            styles={selectStyles}
            value={brandOptions.filter(opt => filters.brands?.includes(opt.value))}
            onChange={(selected) => {
              setFilters({ ...filters, brands: (selected as any[]).map(s => s.value) });
            }}
            placeholder="Select brands..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Unit</Label>
          <Select
            instanceId="unit-select"
            isMulti
            options={unitOptions}
            styles={selectStyles}
            value={unitOptions.filter(opt => filters.units?.includes(opt.value))}
            onChange={(selected) => {
              setFilters({ ...filters, units: (selected as any[]).map(s => s.value) });
            }}
            placeholder="Select units..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Merchant</Label>
          <Select
            instanceId="merchant-select"
            isClearable
            options={merchants}
            styles={selectStyles}
            value={merchants.find(opt => opt.value === filters.merchantId) || null}
            onChange={handleMerchantChange}
            placeholder="Filter by Merchant..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Store</Label>
          <Select
            instanceId="store-select"
            isClearable
            options={stores}
            styles={selectStyles}
            value={stores.find(opt => opt.value === filters.storeId) || null}
            onChange={(selected) => {
              setFilters({ ...filters, storeId: selected ? (selected as any).value : undefined });
            }}
            placeholder="Filter by Store..."
            isDisabled={!filters.merchantId && merchants.length > 0}
          />
        </FormGroup>

        <ButtonGroup>
          <ActionButton $variant="secondary" onClick={handleClear}>Clear</ActionButton>
          <ActionButton onClick={handleSearch}>Search</ActionButton>
        </ButtonGroup>
      </FilterSection>

      <DataTable 
        columns={columns} 
        data={products} 
        onRowClick={(product) => router.push(`/products/${product.id}`)}
        footer={
          <Pagination 
            total={total} 
            page={page} 
            limit={limit} 
            onPageChange={setPage} 
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }} 
          />
        } 
      />
    </PageContainer>
  );
}
