'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { GetMerchantsUseCase } from '../../../application/use-cases/GetMerchantsUseCase';
import { Merchant } from '../../../domain/entities/Merchant';
import { DataTable, Button } from '@apisit110/pos-ui';

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
      
      <DataTable
        columns={columns}
        data={merchants}
        rowKey="uid"
        onRowClick={(merchant) => router.push(`/merchants/${merchant.uid}`)}
      />
    </PageContainer>
  );
}
