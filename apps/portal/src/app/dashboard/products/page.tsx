'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GetProductsUseCase } from '../../../application/use-cases/GetProductsUseCase';
import { GetProductFilterMetadataUseCase } from '../../../application/use-cases/GetProductFilterMetadataUseCase';
import { MockProductRepository } from '../../../infrastructure/repositories/MockProductRepository';
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
    units: []
  });
  
  // Metadata for filters
  const [metadata, setMetadata] = useState<{ brands: string[], units: string[] }>({
    brands: [],
    units: []
  });

  const fetchProducts = useCallback(async (activeFilters: ProductFilter) => {
    const repository = new MockProductRepository();
    const useCase = new GetProductsUseCase(repository);
    const result = await useCase.execute(page, limit, activeFilters);
    setProducts(result.products);
    setTotal(result.total);
  }, [page, limit]);

  useEffect(() => {
    const fetchMetadata = async () => {
      const repository = new MockProductRepository();
      const useCase = new GetProductFilterMetadataUseCase(repository);
      const data = await useCase.execute();
      setMetadata(data);
    };
    fetchMetadata();
  }, []);

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
      units: []
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchProducts(clearedFilters);
  };

  const columns = [
    { header: 'Barcode', accessor: 'barcode' as const, width: '150px' },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Brand', accessor: 'brand' as const },
    { 
      header: 'Price', 
      accessor: (p: Product) => `${p.basePrice.toLocaleString()} ฿` 
    },
  ];

  const brandOptions = metadata.brands.map(b => ({ value: b, label: b }));
  const unitOptions = metadata.units.map(u => ({ value: u, label: u }));

  return (
    <PageContainer>
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

        <ButtonGroup>
          <ActionButton $variant="secondary" onClick={handleClear}>Clear</ActionButton>
          <ActionButton onClick={handleSearch}>Search</ActionButton>
        </ButtonGroup>
      </FilterSection>

      <DataTable 
        columns={columns} 
        data={products} 
        onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
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
