'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { GetStoresUseCase } from '../../../domain/usecases/GetStoresUseCase';
import { Store } from '../../../domain/entities/Store';
import { DataTable, FilterBar, TextFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

interface StoreFilter {
  sid: string;
  name: string;
  mid: string;
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<StoreFilter>({ sid: '', name: '', mid: '' });
  const [activeFilters, setActiveFilters] = useState<StoreFilter>({ sid: '', name: '', mid: '' });

  useEffect(() => {
    const fetchStores = async () => {
      const repository = new ApiStoreRepository();
      const useCase = new GetStoresUseCase(repository);
      const result = await useCase.execute();
      setStores(result);
      setLoading(false);
    };
    fetchStores();
  }, []);

  const handleSearch = () => {
    setActiveFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    const cleared = { sid: '', name: '', mid: '' };
    setFilters(cleared);
    setActiveFilters(cleared);
    setPage(1);
  };

  const filtered = stores.filter(s => {
    const sidMatch = !activeFilters.sid || s.sid.toLowerCase().includes(activeFilters.sid.toLowerCase());
    const nameMatch = !activeFilters.name || s.name.toLowerCase().includes(activeFilters.name.toLowerCase());
    const midMatch = !activeFilters.mid || s.mid.toLowerCase().includes(activeFilters.mid.toLowerCase());
    return sidMatch && nameMatch && midMatch;
  });

  const pagedStores = filtered.slice((page - 1) * limit, page * limit);

  const columns = [
    { header: 'SID', key: 'sid', width: '200px' },
    { header: 'Store Name', key: 'name' },
    { header: 'Address', key: 'address' },
    { header: 'MID', key: 'mid', width: '200px' },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Title>Stores</Title>

      <FilterBar>
        <TextFilter
          label="SID"
          placeholder="Search by SID..."
          value={filters.sid}
          onChange={(value) => setFilters({ ...filters, sid: value })}
        />
        <TextFilter
          label="Store Name"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(value) => setFilters({ ...filters, name: value })}
        />
        <TextFilter
          label="MID"
          placeholder="Search by MID..."
          value={filters.mid}
          onChange={(value) => setFilters({ ...filters, mid: value })}
        />
        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>Clear</ClearFilterButton>
          <Button style={{ width: 'auto' }} onClick={handleSearch}>Search</Button>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={pagedStores}
        rowKey="uid"
        onRowClick={(store) => router.push(`/stores/${store.uid}`)}
        totalItems={filtered.length}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />
    </PageContainer>
  );
}
