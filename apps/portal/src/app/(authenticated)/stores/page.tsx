'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { GetStoresUseCase } from '../../../application/use-cases/GetStoresUseCase';
import { Store } from '../../../domain/entities/Store';
import { DataTable } from '@apisit110/pos-ui';

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

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

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
      <DataTable
        columns={columns}
        data={stores}
        rowKey="uid"
        onRowClick={(store) => router.push(`/stores/${store.uid}`)}
      />
    </PageContainer>
  );
}
