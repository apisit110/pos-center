'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { GetMerchantsUseCase } from '../../../domain/usecases/GetMerchantsUseCase';
import { Merchant } from '../../../domain/entities/Merchant';
import { DataTable, Button, FilterBar, TextFilter, ClearFilterButton } from '@apisit110/pos-ui';
import { useTranslation } from '../../../presentation/i18n/LanguageContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 5;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const SearchCell = styled.div`
  display: flex;
  align-items: flex-start;
  grid-column: 5;
  grid-row: 1;
  /* skip the filter label (line + gap) so the button lines up with the controls */
  padding-top: calc(0.75rem * 1.2 + 0.5rem);

  & > button {
    width: 100%;
    height: 2.3rem;
    margin: 0;
  }
`;

interface MerchantFilter {
  partnerId: string;
  name: string;
}

const EMPTY_FILTERS: MerchantFilter = { partnerId: '', name: '' };

export default function MerchantsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<MerchantFilter>(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState<MerchantFilter>(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;

    const fetchMerchants = async () => {
      setLoading(true);
      try {
        const repository = new ApiMerchantRepository();
        const useCase = new GetMerchantsUseCase(repository);
        const cleanFilters = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== '')
        ) as MerchantFilter;
        const result = await useCase.execute(page, limit, cleanFilters);
        if (!cancelled) {
          setMerchants(result.merchants);
          setTotal(result.total);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMerchants();

    return () => { cancelled = true; };
  }, [page, limit, activeFilters]);

  const handleSearch = () => {
    setActiveFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const columns = [
    { header: t.merchantList.columnPartnerId, key: 'partnerId', width: '200px' },
    { header: t.merchantList.columnNameEn, key: 'nameEn' },
    { header: t.merchantList.columnNameTh, key: 'nameTh' },
  ];

  if (loading && merchants.length === 0) return <div>{t.common.loading}</div>;

  return (
    <PageContainer>
      <Header>
        <Title>{t.merchantList.title}</Title>
        <Button style={{ width: 'auto' }} onClick={() => router.push('/merchants/new')}>{t.merchantList.create}</Button>
      </Header>

      <FilterBar style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        <TextFilter
          label={t.merchantList.partnerId}
          placeholder={t.merchantList.partnerIdPlaceholder}
          value={filters.partnerId}
          onChange={(value) => setFilters({ ...filters, partnerId: value })}
        />
        <TextFilter
          label={t.merchantList.name}
          placeholder={t.merchantList.namePlaceholder}
          value={filters.name}
          onChange={(value) => setFilters({ ...filters, name: value })}
        />
        <SearchCell>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </SearchCell>
        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>{t.common.clear}</ClearFilterButton>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={merchants}
        rowKey="uid"
        onRowClick={(merchant) => router.push(`/merchants/detail?id=${merchant.uid}`)}
        totalItems={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '1rem' }}>{t.common.loading}</div>
      )}
    </PageContainer>
  );
}
