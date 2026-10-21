'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, DataTable } from '@apisit110/pos-ui';
import { useParams, useRouter } from 'next/navigation';
import { GetTransactionDetailUseCase } from '../../../../domain/usecases/GetTransactionDetailUseCase';
import { ApiTransactionRepository } from '../../../../infrastructure/repositories/ApiTransactionRepository';
import { TransactionDetail, TransactionItem } from '../../../../domain/entities/Transaction';
import { formatDateTime } from '../../../../lib/dayjs';
import { formatAmount } from '../../../../lib/formatAmount';
import { StatusTimeline, TimelineStep } from '../../../../presentation/components/StatusTimeline';
import { FiArrowLeft } from 'react-icons/fi';

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

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'approved': return 'rgba(34, 197, 94, 0.15)';
      case 'failed': return 'rgba(239, 68, 68, 0.15)';
      case 'pending': return 'rgba(234, 179, 8, 0.15)';
      case 'refunded': return 'rgba(99, 102, 241, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'approved': return '#4ade80';
      case 'failed': return '#f87171';
      case 'pending': return '#fbbf24';
      case 'refunded': return '#818cf8';
      default: return '#94a3b8';
    }
  }};
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

const methodLabels: Record<string, string> = { cash: 'Cash', qr: 'QR' };

const itemColumns = [
  { header: '#', key: 'index', render: (_: TransactionItem, index?: number) => (index ?? 0) + 1 },
  { header: 'Product', key: 'name' },
  { header: 'SKU', key: 'sku', render: (i: TransactionItem) => i.sku || '-' },
  { header: 'Barcode', key: 'barcode', render: (i: TransactionItem) => i.barcode || '-' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price', key: 'price', render: (i: TransactionItem) => formatAmount(i.price) },
  {
    header: 'Total',
    key: 'total',
    render: (i: TransactionItem) => <span style={{ fontWeight: 600 }}>{formatAmount(i.total)}</span>,
  },
];

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
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
  if (!detail) return <div style={{ padding: '2rem', textAlign: 'center' }}>Transaction not found</div>;

  const tx = detail.transaction;
  const approved = tx.status === 'approved';
  // only created_at is recorded, so no time is shown for the status step
  const steps: TimelineStep[] = [
    { label: 'Created', time: formatDateTime(tx.createdAt), done: true },
    { label: approved ? 'Approved' : capitalize(tx.status), done: approved },
  ];

  return (
    <Container>
      <Header>
        <Button variant="secondary" style={{ width: 'auto', padding: '0.75rem' }} onClick={() => router.back()}>
          <FiArrowLeft size={20} />
        </Button>
        <Title>Transaction Details</Title>
      </Header>

      <TwoColumns>
        <Card>
          <SectionTitle>Details</SectionTitle>
          <InfoGrid>
            <div>
              <Label>Transaction ID</Label>
              <Value style={{ fontFamily: 'monospace' }}>{tx.uid}</Value>
            </div>
            <div>
              <Label>Order ID</Label>
              <Value style={{ fontFamily: 'monospace' }}>{tx.orderId || '-'}</Value>
            </div>
            <div>
              <Label>Merchant MID</Label>
              <Value>{detail.mid}</Value>
            </div>
            <div>
              <Label>Store</Label>
              <Value>{tx.storeName || '-'}</Value>
            </div>
            <div>
              <Label>Terminal</Label>
              <Value>{detail.terminalId || '-'}</Value>
            </div>
            <div>
              <Label>Staff</Label>
              <Value>{detail.staffName || '-'}</Value>
            </div>
          </InfoGrid>
        </Card>

        <Card>
          <SectionTitle>Amount</SectionTitle>
          <InfoGrid>
            <div>
              <Label>Status</Label>
              <StatusBadge $status={tx.status}>{capitalize(tx.status)}</StatusBadge>
            </div>
            <div>
              <Label>Order Status</Label>
              <Value>{capitalize(detail.orderStatus)}</Value>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Value>{methodLabels[tx.paymentMethod] ?? tx.paymentMethod}</Value>
            </div>
            <div>
              <Label>Amount</Label>
              <Value>{formatAmount(tx.amount)} {tx.currency}</Value>
            </div>
          </InfoGrid>
        </Card>

        <Card>
          <SectionTitle>Timeline</SectionTitle>
          <StatusTimeline steps={steps} />
        </Card>
      </TwoColumns>

      <Card>
        <SectionTitle>Items ({detail.items.length})</SectionTitle>
        <DataTable columns={itemColumns} data={detail.items} rowKey="productUid" />
        <TotalRow>
          <Label style={{ margin: 0 }}>Order Total</Label>
          <Value>{formatAmount(detail.orderTotalAmount)} {tx.currency}</Value>
        </TotalRow>
      </Card>
    </Container>
  );
}
