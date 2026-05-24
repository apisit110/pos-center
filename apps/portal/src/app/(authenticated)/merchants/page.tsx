'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { GetMerchantsUseCase } from '../../../application/use-cases/GetMerchantsUseCase';
import { Merchant } from '../../../domain/entities/Merchant';
import { DataTable, Button, FilterBar, TextFilter, ClearFilterButton } from '@apisit110/pos-ui';

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
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

interface MerchantFilter {
  mid: string;
  name: string;
}

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<MerchantFilter>({ mid: '', name: '' });
  const [activeFilters, setActiveFilters] = useState<MerchantFilter>({ mid: '', name: '' });

  const fetchMerchants = async () => {
    setLoading(true);
    const repository = new ApiMerchantRepository();
    const useCase = new GetMerchantsUseCase(repository);
    const result = await useCase.execute();
    setMerchants(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleSearch = () => {
    setActiveFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    const cleared = { mid: '', name: '' };
    setFilters(cleared);
    setActiveFilters(cleared);
    setPage(1);
  };

  const filtered = merchants.filter(m => {
    const midMatch = !activeFilters.mid || m.mid.toLowerCase().includes(activeFilters.mid.toLowerCase());
    const nameMatch = !activeFilters.name || m.name.toLowerCase().includes(activeFilters.name.toLowerCase());
    return midMatch && nameMatch;
  });

  const pagedMerchants = filtered.slice((page - 1) * limit, page * limit);

  const columns = [
    { header: 'MID', key: 'mid', width: '200px' },
    { header: 'Merchant Name', key: 'name' },
  ];

  if (loading && merchants.length === 0) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Header>
        <Title>Merchants</Title>
        <Button style={{ width: 'auto' }} onClick={() => router.push('/merchants/new')}>Create Merchant</Button>
      </Header>

      <FilterBar>
        <TextFilter
          label="MID"
          placeholder="Search by MID..."
          value={filters.mid}
          onChange={(value) => setFilters({ ...filters, mid: value })}
        />
        <TextFilter
          label="Merchant Name"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(value) => setFilters({ ...filters, name: value })}
        />
        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>Clear</ClearFilterButton>
          <Button style={{ width: 'auto' }} onClick={handleSearch}>Search</Button>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={pagedMerchants}
        rowKey="uid"
        onRowClick={(merchant) => router.push(`/merchants/${merchant.uid}`)}
        totalItems={filtered.length}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />
    </PageContainer>
  );
}
