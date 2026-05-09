'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { GetMerchantsUseCase } from '../../../application/use-cases/GetMerchantsUseCase';
import { Merchant } from '../../../domain/entities/Merchant';
import { DataTable } from '../../../presentation/components/DataTable';

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

const CreateButton = styled.button`
  width: auto;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
`;

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    { header: 'MID', accessor: 'mid' as const, width: '200px' },
    { header: 'Merchant Name', accessor: 'name' as const },
  ];

  if (loading && merchants.length === 0) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Header>
        <Title>Merchants</Title>
        <CreateButton onClick={() => router.push('/merchants/new')}>Create Merchant</CreateButton>
      </Header>
      
      <DataTable 
        columns={columns} 
        data={merchants} 
        onRowClick={(merchant) => router.push(`/merchants/${merchant.uid}`)}
      />
    </PageContainer>
  );
}
