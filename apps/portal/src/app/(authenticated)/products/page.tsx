'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { GetProductsUseCase } from '../../../domain/usecases/GetProductsUseCase';
import { GetProductFilterMetadataUseCase } from '../../../domain/usecases/GetProductFilterMetadataUseCase';
import { GetMerchantsUseCase } from '../../../domain/usecases/GetMerchantsUseCase';
import { GetStoresUseCase } from '../../../domain/usecases/GetStoresUseCase';
import { ApiProductRepository } from '../../../infrastructure/repositories/ApiProductRepository';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductFilter } from '../../../domain/repositories/ProductRepository';
import { formatAmount } from '../../../lib/formatAmount';
import { DataTable, FilterBar, TextFilter, SelectFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../presentation/i18n/LanguageContext';

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

const ProductFilterBar = styled(FilterBar)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: start;
`;

const ButtonCell = styled.div`
  display: flex;
  align-items: flex-start;
  /* skip the filter label (line + gap) so buttons line up with the controls */
  padding-top: calc(0.75rem * 1.2 + 0.5rem);

  & > button {
    width: 100%;
    height: 38px;
    margin: 0;
  }
`;


export default function ProductsPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
      const merchantData = await merchantUC.execute(1, 100);
      setMerchants(merchantData.merchants.map(m => ({ value: m.uid, label: m.name })));

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
    { header: t.productList.barcode, key: 'barcode', width: '150px' },
    { header: t.productList.columnName, key: 'name' },
    { header: t.productList.brand, key: 'brand' },
    { header: t.productList.unit, key: 'unitName' },
    { header: t.productList.merchant, key: 'merchant', render: (p: Product) => merchantMap[p.merchantId] || p.mid },
    { header: t.productList.columnPrice, key: 'price', render: (p: Product) => `${formatAmount(p.basePrice)} ฿` },
  ];

  const brandOptions = metadata.brands.map(b => ({ value: b, label: b }));
  const unitOptions = metadata.units.map(u => ({ value: u, label: u }));

  return (
    <PageContainer>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
        <Button style={{ width: 'auto' }} onClick={() => router.push('/products/new')}>{t.productList.addProduct}</Button>
      </div>
      <ProductFilterBar>
        <TextFilter
          label={t.productList.barcode}
          placeholder={t.productList.barcodePlaceholder}
          value={filters.barcode}
          onChange={(value) => setFilters({ ...filters, barcode: value })}
        />

        <TextFilter
          label={t.productList.name}
          placeholder={t.productList.namePlaceholder}
          value={filters.name}
          onChange={(value) => setFilters({ ...filters, name: value })}
        />

        <TextFilter
          label={t.productList.maxPrice}
          placeholder={t.productList.maxPricePlaceholder}
          value={filters.price === undefined ? '' : String(filters.price)}
          onChange={(value) => {
            const price = Number(value);
            setFilters({ ...filters, price: value && !Number.isNaN(price) ? price : undefined });
          }}
        />

        <SelectFilter
          label={t.productList.brand}
          value={filters.brand}
          onChange={(value) => setFilters({ ...filters, brand: value })}
          options={brandOptions}
          placeholder={t.productList.brandAll}
        />

        <ButtonCell>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </ButtonCell>

        <SelectFilter
          label={t.productList.unit}
          value={filters.unit}
          onChange={(value) => setFilters({ ...filters, unit: value })}
          options={unitOptions}
          placeholder={t.productList.unitAll}
        />

        <SelectFilter
          label={t.productList.merchant}
          value={filters.merchantId ?? ''}
          onChange={(value) => handleMerchantChange(value ? { value } : null)}
          options={merchants}
          placeholder={t.productList.merchantAll}
        />

        <SelectFilter
          label={t.productList.store}
          value={filters.storeId ?? ''}
          onChange={(value) => setFilters({ ...filters, storeId: value || undefined })}
          options={stores}
          placeholder={t.productList.storeAll}
          disabled={!filters.merchantId && merchants.length > 0}
        />

        <div />

        <ButtonCell>
          <ClearFilterButton onClick={handleClear}>{t.common.clear}</ClearFilterButton>
        </ButtonCell>
      </ProductFilterBar>

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
