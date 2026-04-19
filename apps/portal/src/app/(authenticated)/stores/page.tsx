'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { GetStoresUseCase } from '../../../application/use-cases/GetStoresUseCase';
import { Store } from '../../../domain/entities/Store';
import { DataTable } from '../../../presentation/components/DataTable';

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
    { header: 'ID', accessor: 'id' as const, width: '100px' },
    { header: 'Store Name', accessor: 'name' as const },
    { header: 'Address', accessor: 'address' as const },
    { header: 'Merchant ID', accessor: 'merchantId' as const },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Title>Stores</Title>
      <DataTable 
        columns={columns} 
        data={stores} 
        onRowClick={(store) => console.log('Clicked', store)}
      />
    </PageContainer>
  );
}
