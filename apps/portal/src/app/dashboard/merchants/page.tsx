'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MockMerchantRepository } from '../../../infrastructure/repositories/MockMerchantRepository';
import { Merchant } from '../../../domain/entities/Merchant';
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

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      const repository = new MockMerchantRepository();
      // Since we don't have a getMerchants method in the interface yet, 
      // I'll assume we can list them or I'll add the method.
      // For now, I'll mock the list as we have the data in the repository.
      const result = [
        new Merchant('M-123', 'Lightning Coffee'),
        new Merchant('M-456', 'Super Bakery')
      ];
      setMerchants(result);
      setLoading(false);
    };
    fetchMerchants();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as const, width: '150px' },
    { header: 'Merchant Name', accessor: 'name' as const },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Title>Merchants</Title>
      <DataTable 
        columns={columns} 
        data={merchants} 
        onRowClick={(merchant) => console.log('Clicked', merchant)}
      />
    </PageContainer>
  );
}
