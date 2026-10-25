'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, DataTable, StatusTimeline } from '@apisit110/pos-ui';
import type { TimelineStep } from '@apisit110/pos-ui';
import { useParams, useRouter } from 'next/navigation';
import { GetTransactionDetailUseCase } from '../../../../domain/usecases/GetTransactionDetailUseCase';
import { ApiTransactionRepository } from '../../../../infrastructure/repositories/ApiTransactionRepository';
import { TransactionDetail, TransactionItem } from '../../../../domain/entities/Transaction';
import { formatDateTime } from '../../../../lib/dayjs';
import { formatAmount } from '../../../../lib/formatAmount';
import { TransactionStatusBadge } from '../../../../presentation/components/TransactionStatusBadge';
import { FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from '../../../../presentation/i18n/LanguageContext';
import { formatMessage } from '../../../../presentation/i18n/format';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: var(--text-main);
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
`;

const Label = styled.div`
  color: var(--text-sub);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  color: var(--text-main);
  font-size: 1.125rem;
  font-weight: 600;
  word-break: break-all;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 1rem;
  color: var(--text-main);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '-');

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useTranslation();
  const td = t.transactionDetail;
  const methodLabels: Record<string, string> = {
    cash: t.transactionList.methodCash,
    qr_promptpay: t.transactionList.methodQr,
  };
  const statusLabel = (status: string) =>
    t.transactionStatus[status?.toLowerCase() as keyof typeof t.transactionStatus] ?? capitalize(status);
  const itemColumns = [
    { header: '#', key: 'index', render: (_: TransactionItem, index?: number) => (index ?? 0) + 1 },
    { header: td.columnProduct, key: 'name', render: (i: TransactionItem) => i.displayName(language) },
    { header: td.columnSku, key: 'sku', render: (i: TransactionItem) => i.sku || '-' },
    { header: td.columnBarcode, key: 'barcode', render: (i: TransactionItem) => i.barcode || '-' },
    { header: td.columnQuantity, key: 'quantity' },
    { header: td.columnUnitPrice, key: 'price', render: (i: TransactionItem) => formatAmount(i.price) },
    {
      header: td.columnTotal,
      key: 'total',
      render: (i: TransactionItem) => <span style={{ fontWeight: 600 }}>{formatAmount(i.total)}</span>,
    },
  ];
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!params.id) return;
      try {
        const useCase = new GetTransactionDetailUseCase(new ApiTransactionRepository());
        const result = await useCase.execute(params.id as string);
        if (!cancelled) setDetail(result);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!detail) return <div style={{ padding: '2rem', textAlign: 'center' }}>{td.notFound}</div>;

  const tx = detail.transaction;
  const approved = tx.status === 'approved';
  // only created_at is recorded, so no time is shown for the status step
  const steps: TimelineStep[] = [
    { label: td.timelineCreated, time: formatDateTime(tx.createdAt), done: true },
    { label: statusLabel(tx.status), done: approved },
  ];

  return (
    <Container>
      <Header>
        <Button variant="secondary" style={{ width: 'auto', padding: '0.75rem' }} onClick={() => router.back()}>
          <FiArrowLeft size={20} />
        </Button>
        <Title>{td.title}</Title>
      </Header>

      <TwoColumns>
        <Card>
          <SectionTitle>{td.details}</SectionTitle>
          <InfoGrid>
            <div>
              <Label>{td.transactionId}</Label>
              <Value style={{ fontFamily: 'monospace' }}>{tx.uid}</Value>
            </div>
            <div>
              <Label>{td.orderId}</Label>
              <Value style={{ fontFamily: 'monospace' }}>{tx.orderId || '-'}</Value>
            </div>
            <div>
              <Label>{td.merchantPartnerId}</Label>
              <Value>{detail.partnerId || '-'}</Value>
            </div>
            <div>
              <Label>{td.store}</Label>
              <Value>{tx.storeName(language) || '-'}</Value>
            </div>
            <div>
              <Label>{td.terminal}</Label>
              <Value>{detail.terminalId || '-'}</Value>
            </div>
            <div>
              <Label>{td.staff}</Label>
              <Value>{tx.staffName || '-'}</Value>
            </div>
          </InfoGrid>
        </Card>

        <Card>
          <SectionTitle>{td.amountSection}</SectionTitle>
          <InfoGrid>
            <div>
              <Label>{td.status}</Label>
              <TransactionStatusBadge status={tx.status} />
            </div>
            <div>
              <Label>{td.orderStatus}</Label>
              <Value>{statusLabel(detail.orderStatus)}</Value>
            </div>
            <div>
              <Label>{td.paymentMethod}</Label>
              <Value>{methodLabels[tx.paymentMethod] ?? tx.paymentMethod}</Value>
            </div>
            <div>
              <Label>{td.amount}</Label>
              <Value>{formatAmount(tx.amount)} {tx.currency}</Value>
            </div>
          </InfoGrid>
        </Card>

        <Card>
          <SectionTitle>{td.timeline}</SectionTitle>
          <StatusTimeline steps={steps} />
        </Card>
      </TwoColumns>

      <Card>
        <SectionTitle>{formatMessage(td.items, { count: detail.items.length })}</SectionTitle>
        <DataTable columns={itemColumns} data={detail.items} rowKey="productUid" />
        <TotalRow>
          <Label style={{ margin: 0 }}>{td.orderTotal}</Label>
          <Value>{formatAmount(detail.orderTotalAmount)} {tx.currency}</Value>
        </TotalRow>
      </Card>
    </Container>
  );
}
