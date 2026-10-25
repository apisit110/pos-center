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
import { CreateMerchantCredentialUseCase } from '../../../../domain/usecases/CreateMerchantCredentialUseCase';
import { RotateMerchantCredentialUseCase } from '../../../../domain/usecases/RotateMerchantCredentialUseCase';
import {
  IssuedMerchantCredential,
  Merchant,
  MERCHANT_CREDENTIAL_PROVIDERS,
  MerchantCredential,
  MerchantCredentialProvider,
} from '../../../../domain/entities/Merchant';
import { Store, formatStoreAddress } from '../../../../domain/entities/Store';
import { Staff } from '../../../../domain/entities/Staff';
import { DataTable, Button } from '@apisit110/pos-ui';
import { useTranslation } from '../../../../presentation/i18n/LanguageContext';
import { formatDateTime } from '../../../../lib/dayjs';

import { FiAlertTriangle, FiArrowLeft, FiCopy, FiGrid, FiHash, FiInfo, FiKey, FiPlus, FiRefreshCw, FiUsers } from 'react-icons/fi';

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
  gap: 1rem;
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
  white-space: nowrap;
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

const SecretPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.35);
`;

const SecretWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f59e0b;
  font-weight: 600;
  font-size: 0.875rem;
`;

const SecretRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SecretValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SecretValue = styled.code`
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  color: var(--text-main);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
`;

const ErrorText = styled.div`
  margin-bottom: 1rem;
  color: #ef4444;
  font-size: 0.875rem;
`;

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'forbidden' | 'notFound' | null>(null);
  const [issued, setIssued] = useState<IssuedMerchantCredential | null>(null);
  const [credentialBusy, setCredentialBusy] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'clientId' | 'clientSecret' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);
      const merchantRepo = new ApiMerchantRepository();
      const storeRepo = new ApiStoreRepository();
      const staffRepo = new ApiStaffRepository();

      const getMerchantUseCase = new GetMerchantUseCase(merchantRepo);
      const getStoresUseCase = new GetStoresUseCase(storeRepo);
      const getStaffUseCase = new GetStaffByMerchantUseCase(staffRepo);

      const merchantId = params.id as string;
      try {
        const [merchantData, storesData, staffData] = await Promise.all([
          getMerchantUseCase.execute(merchantId),
          getStoresUseCase.execute(merchantId),
          getStaffUseCase.execute(merchantId)
        ]);

        setMerchant(merchantData);
        setStores(storesData);
        setStaff(staffData);
      } catch (err: any) {
        setMerchant(null);
        setError(err?.response?.status === 403 ? 'forbidden' : 'notFound');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const storeColumns = [
    { header: t.merchantDetail.columnSid, key: 'sid', width: '150px' },
    { header: t.merchantDetail.columnStoreName, key: 'name', render: (s: Store) => s.displayName(language) },
    {
      header: t.merchantDetail.columnAddress,
      key: 'address',
      render: (s: Store) => formatStoreAddress(s.registeredAddress, language) || '-',
    },
  ];

  const issueCredential = async (action: 'create' | 'rotate', provider: MerchantCredentialProvider) => {
    if (!merchant) return;
    if (action === 'rotate' && !window.confirm(t.merchantDetail.rotateConfirm)) return;

    setCredentialBusy(true);
    setCredentialError(null);
    setIssued(null);
    const merchantRepo = new ApiMerchantRepository();
    try {
      const useCase = action === 'create'
        ? new CreateMerchantCredentialUseCase(merchantRepo)
        : new RotateMerchantCredentialUseCase(merchantRepo);
      setIssued(await useCase.execute(merchant.uid, provider));
      // reload to show the new created / rotated time
      const refreshed = await new GetMerchantUseCase(merchantRepo).execute(merchant.uid);
      if (refreshed) setMerchant(refreshed);
    } catch (err) {
      setCredentialError((err instanceof Error && err.message) || t.merchantDetail.credentialFailed);
    } finally {
      setCredentialBusy(false);
    }
  };

  const copyToClipboard = async (field: 'clientId' | 'clientSecret', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard not available (e.g. not https), the value is still shown to copy by hand
    }
  };

  const missingProvider = MERCHANT_CREDENTIAL_PROVIDERS.find(
    (provider) => !merchant?.credentials.some((c) => c.provider === provider),
  );

  const credentialColumns = [
    { header: t.merchantDetail.columnProvider, key: 'provider', width: '160px' },
    {
      header: t.merchantDetail.columnClientId,
      key: 'clientId',
      render: (c: MerchantCredential) => <span style={{ fontFamily: 'monospace' }}>{c.clientId}</span>,
    },
    {
      header: t.merchantDetail.columnCreatedAt,
      key: 'createdAt',
      width: '200px',
      render: (c: MerchantCredential) => formatDateTime(c.createdAt),
    },
    {
      header: t.merchantDetail.columnLastRotatedAt,
      key: 'updatedAt',
      width: '200px',
      render: (c: MerchantCredential) => formatDateTime(c.updatedAt),
    },
    {
      header: '',
      key: 'actions',
      width: '140px',
      render: (c: MerchantCredential) => (
        <Button
          variant="secondary"
          disabled={credentialBusy}
          onClick={() => issueCredential('rotate', c.provider as MerchantCredentialProvider)}
        >
          <FiRefreshCw /> {t.merchantDetail.rotateSecret}
        </Button>
      ),
    },
  ];

  const staffColumns = [
    { header: t.merchantDetail.columnName, key: 'name' },
    { header: t.merchantDetail.columnUsername, key: 'username' },
    {
      header: t.merchantDetail.columnRole,
      key: 'role',
      render: (s: Staff) => t.staffRole[s.role?.toLowerCase() as keyof typeof t.staffRole] ?? s.role,
    },
    {
      header: t.merchantDetail.columnStatus,
      key: 'status',
      width: '120px',
      render: (s: Staff) => t.staffStatus[s.status?.toLowerCase() as keyof typeof t.staffStatus] ?? s.status,
    },
  ];

  if (loading) return <div>{t.common.loading}</div>;
  if (!merchant) return <div>{error === 'forbidden' ? t.merchantDetail.forbidden : t.merchantDetail.notFound}</div>;

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <Button variant="secondary" style={{ width: '44px', height: '44px', padding: 0 }} onClick={() => router.back()}>
            <FiArrowLeft />
          </Button>
          <TitleContainer>
            <Subtitle>{t.merchantDetail.subtitle}</Subtitle>
            <Title>{merchant.displayName(language)}</Title>
          </TitleContainer>
        </HeaderLeft>
      </Header>

      <ContentGrid>
        <Card>
          <CardHeader>
            <CardTitle>
              <FiInfo /> {t.merchantDetail.information}
            </CardTitle>
          </CardHeader>
          <InfoGrid>
            <InfoItem>
              <IconWrapper $color="#6366f1">
                <FiHash />
              </IconWrapper>
              <InfoContent>
                <Label>{t.merchantDetail.partnerId}</Label>
                <Value>{merchant.partnerId}</Value>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <IconWrapper $color="#10b981">
                <FiGrid />
              </IconWrapper>
              <InfoContent>
                <Label>{t.merchantDetail.uid}</Label>
                <Value style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{merchant.uid}</Value>
              </InfoContent>
            </InfoItem>
          </InfoGrid>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <FiKey /> {t.merchantDetail.credentials}
              <Badge>{merchant.credentials.length}</Badge>
            </CardTitle>
            {missingProvider && (
              <Button
                style={{ width: 'auto', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                isLoading={credentialBusy}
                disabled={credentialBusy}
                onClick={() => issueCredential('create', missingProvider)}
              >
                <FiPlus /> {t.merchantDetail.createCredential}
              </Button>
            )}
          </CardHeader>
          {credentialError && <ErrorText>{credentialError}</ErrorText>}
          {issued && (
            <SecretPanel>
              <SecretWarning>
                <FiAlertTriangle /> {t.merchantDetail.secretShownOnce}
              </SecretWarning>
              <SecretRow>
                <Label>{t.merchantDetail.columnClientId} ({issued.provider})</Label>
                <SecretValueRow>
                  <SecretValue>{issued.clientId}</SecretValue>
                  <Button variant="secondary" onClick={() => copyToClipboard('clientId', issued.clientId)}>
                    <FiCopy /> {copiedField === 'clientId' ? t.merchantDetail.copied : t.merchantDetail.copy}
                  </Button>
                </SecretValueRow>
              </SecretRow>
              <SecretRow>
                <Label>{t.merchantDetail.clientSecret}</Label>
                <SecretValueRow>
                  <SecretValue>{issued.clientSecret}</SecretValue>
                  <Button variant="secondary" onClick={() => copyToClipboard('clientSecret', issued.clientSecret)}>
                    <FiCopy /> {copiedField === 'clientSecret' ? t.merchantDetail.copied : t.merchantDetail.copy}
                  </Button>
                </SecretValueRow>
              </SecretRow>
              <div>
                <Button variant="secondary" onClick={() => setIssued(null)}>
                  {t.merchantDetail.secretSaved}
                </Button>
              </div>
            </SecretPanel>
          )}
          <DataTable
            columns={credentialColumns}
            data={merchant.credentials}
            rowKey="clientId"
            emptyMessage={t.merchantDetail.noCredentials}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <FiGrid /> {t.merchantDetail.relatedStores}
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
              <FiUsers /> {t.merchantDetail.staff}
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
