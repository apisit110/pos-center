'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../../infrastructure/repositories/ApiStoreRepository';
import { ApiStaffRepository } from '../../../../infrastructure/repositories/ApiStaffRepository';
import { GetMerchantUseCase } from '../../../../domain/usecases/GetMerchantUseCase';
import { GetStoresUseCase } from '../../../../domain/usecases/GetStoresUseCase';
import { GetStaffByMerchantUseCase } from '../../../../domain/usecases/GetStaffByMerchantUseCase';
import { Merchant } from '../../../../domain/entities/Merchant';
import { Store } from '../../../../domain/entities/Store';
import { Staff } from '../../../../domain/entities/Staff';
import { DataTable, Button } from '@apisit110/pos-ui';

import { FiArrowLeft, FiGrid, FiHash, FiInfo, FiUsers } from 'react-icons/fi';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;


const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.span`
  color: var(--text-sub);
  font-size: 0.875rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
`;

const Card = styled.div`
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid var(--border);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.span`
  font-size: 0.75rem;
  color: var(--text-sub);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  background: var(--primary);
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      setLoading(true);
      const merchantRepo = new ApiMerchantRepository();
      const storeRepo = new ApiStoreRepository();
      const staffRepo = new ApiStaffRepository();

      const getMerchantUseCase = new GetMerchantUseCase(merchantRepo);
      const getStoresUseCase = new GetStoresUseCase(storeRepo);
      const getStaffUseCase = new GetStaffByMerchantUseCase(staffRepo);

      const merchantId = params.id as string;
      const [merchantData, storesData, staffData] = await Promise.all([
        getMerchantUseCase.execute(merchantId),
        getStoresUseCase.execute(merchantId),
        getStaffUseCase.execute(merchantId)
      ]);

      setMerchant(merchantData);
      setStores(storesData);
      setStaff(staffData);
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  const storeColumns = [
    { header: 'SID', key: 'sid', width: '150px' },
    { header: 'Store Name', key: 'name' },
    { header: 'Address', key: 'address' },
  ];

  const staffColumns = [
    { header: 'Name', key: 'name' },
    { header: 'Username', key: 'username' },
    { header: 'Role', key: 'role' },
    { header: 'Status', key: 'status', width: '120px' },
  ];

  if (loading) return <div>Loading...</div>;
  if (!merchant) return <div>Merchant not found</div>;

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <Button variant="secondary" style={{ width: '44px', height: '44px', padding: 0 }} onClick={() => router.back()}>
            <FiArrowLeft />
          </Button>
          <TitleContainer>
            <Subtitle>MERCHANT MANAGEMENT</Subtitle>
            <Title>{merchant.name}</Title>
          </TitleContainer>
        </HeaderLeft>
      </Header>

      <ContentGrid>
        <Card>
          <CardHeader>
            <CardTitle>
              <FiInfo /> Merchant Information
            </CardTitle>
          </CardHeader>
          <InfoGrid>
            <InfoItem>
              <IconWrapper $color="#6366f1">
                <FiHash />
              </IconWrapper>
              <InfoContent>
                <Label>Merchant ID (MID)</Label>
                <Value>{merchant.mid}</Value>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <IconWrapper $color="#10b981">
                <FiGrid />
              </IconWrapper>
              <InfoContent>
                <Label>Unique ID (UID)</Label>
                <Value style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{merchant.uid}</Value>
              </InfoContent>
            </InfoItem>
          </InfoGrid>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <FiGrid /> Related Stores
              <Badge>{stores.length}</Badge>
            </CardTitle>
          </CardHeader>
          <DataTable
            columns={storeColumns}
            data={stores}
            rowKey="uid"
            onRowClick={(store) => router.push(`/stores/${store.uid}`)}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <FiUsers /> Staff
              <Badge>{staff.length}</Badge>
            </CardTitle>
          </CardHeader>
          <DataTable
            columns={staffColumns}
            data={staff}
          />
        </Card>
      </ContentGrid>
    </PageContainer>
  );
}
