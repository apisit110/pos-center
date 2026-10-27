'use client';

import React, { Suspense, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiStoreRepository } from '../../../../infrastructure/repositories/ApiStoreRepository';
import { ApiTerminalRepository } from '../../../../infrastructure/repositories/ApiTerminalRepository';
import { GetStoreDetailUseCase } from '../../../../domain/usecases/GetStoreDetailUseCase';
import { GetTerminalsByStoreUseCase } from '../../../../domain/usecases/GetTerminalsByStoreUseCase';
import { Store, formatStoreAddress } from '../../../../domain/entities/Store';
import { Terminal } from '../../../../domain/entities/Terminal';
import { DataTable, Button } from '@apisit110/pos-ui';
import { useTranslation } from '../../../../presentation/i18n/LanguageContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;


const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
`;

const DetailCard = styled.div`
  background: var(--bg-card);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.875rem;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-main);
`;

function StoreDetailPageContent() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { language } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      const storeRepo = new ApiStoreRepository();
      const terminalRepo = new ApiTerminalRepository();
      
      const getStoreDetailUseCase = new GetStoreDetailUseCase(storeRepo);
      const getTerminalsUseCase = new GetTerminalsByStoreUseCase(terminalRepo);
      
      const storeId = id;
      const [storeData, terminalsData] = await Promise.all([
        getStoreDetailUseCase.execute(storeId),
        getTerminalsUseCase.execute(storeId)
      ]);
      
      setStore(storeData);
      setTerminals(terminalsData);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const terminalColumns = [
    { header: 'Terminal ID', key: 'tid' },
    { header: 'Terminal Name (EN)', key: 'nameEn' },
    { header: 'Terminal Name (TH)', key: 'nameTh' },
    { header: 'Internal ID', key: 'id', width: '300px' },
  ];

  if (loading) return <div>Loading...</div>;
  if (!store) return <div>Store not found</div>;

  return (
    <PageContainer>
      <Header>
        <Button variant="secondary" style={{ width: 'auto' }} onClick={() => router.back()}>← Back</Button>
        <Title>Store Details</Title>
      </Header>

      <DetailCard>
        <InfoItem>
          <Label>Store ID (SID)</Label>
          <Value>{store.sid}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Store Name (EN)</Label>
          <Value>{store.nameEn}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Store Name (TH)</Label>
          <Value>{store.nameTh}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Partner ID</Label>
          <Value>{store.partnerId}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Registered Address</Label>
          <Value>{formatStoreAddress(store.registeredAddress, language) || '-'}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Contract Address</Label>
          <Value>{formatStoreAddress(store.contractAddress, language) || '-'}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Unique ID (UID)</Label>
          <Value style={{ fontSize: '0.75rem', opacity: 0.5 }}>{store.uid}</Value>
        </InfoItem>
      </DetailCard>

      <SectionTitle>Terminals</SectionTitle>
      <DataTable 
        columns={terminalColumns} 
        data={terminals} 
      />
    </PageContainer>
  );
}

// static export (S3) has no /stores/[id] routes: the id comes from `?id=`, and useSearchParams needs a Suspense boundary
export default function StoreDetailPage() {
  return (
    <Suspense>
      <StoreDetailPageContent />
    </Suspense>
  );
}
