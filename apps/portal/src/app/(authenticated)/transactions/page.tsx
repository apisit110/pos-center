'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatDateTime } from '../../../lib/dayjs';
import { DataTable, FilterBar, TextFilter, SelectFilter, DateFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';
import { GetTransactionsUseCase } from '../../../application/use-cases/GetTransactionsUseCase';
import { ApiTransactionRepository } from '../../../infrastructure/repositories/ApiTransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';
import { TransactionFilter } from '../../../application/repositories/TransactionRepository';

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.2rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'success': return 'rgba(34, 197, 94, 0.15)';
      case 'failed': return 'rgba(239, 68, 68, 0.15)';
      case 'pending': return 'rgba(234, 179, 8, 0.15)';
      case 'refunded': return 'rgba(99, 102, 241, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'success': return '#4ade80';
      case 'failed': return '#f87171';
      case 'pending': return '#fbbf24';
      case 'refunded': return '#818cf8';
      default: return '#94a3b8';
    }
  }};
`;

const EMPTY_FILTERS: TransactionFilter = {
  startDate: '',
  endDate: '',
  transactionId: '',
  method: '',
  status: '',
};

const methodOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'qr_code', label: 'QR Code' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wallet', label: 'Wallet' },
];

const statusOptions = [
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const columns = [
  {
    header: 'Date',
    key: 'createdAt',
    render: (tx: Transaction) => formatDateTime(tx.createdAt),
  },
  {
    header: 'Transaction ID',
    key: 'id',
    render: (tx: Transaction) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tx.id}</span>
    ),
  },
  {
    header: 'Method',
    key: 'paymentMethod',
    render: (tx: Transaction) => tx.paymentMethod,
  },
  {
    header: 'Amount',
    key: 'amount',
    render: (tx: Transaction) => (
      <span style={{ fontWeight: 600 }}>
        {tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} {tx.currency}
      </span>
    ),
  },
  { header: 'Store', key: 'storeName' },
  {
    header: 'Status',
    key: 'status',
    render: (tx: Transaction) => (
      <StatusBadge $status={tx.status}>
        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()}
      </StatusBadge>
    ),
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<TransactionFilter>(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState<TransactionFilter>(EMPTY_FILTERS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const repository = new ApiTransactionRepository();
        const useCase = new GetTransactionsUseCase(repository);
        const cleanFilters = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== '' && v !== undefined)
        ) as TransactionFilter;
        const result = await useCase.execute(page, limit, cleanFilters);
        if (!cancelled) {
          setTransactions(result.transactions);
          setTotal(result.total);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [page, limit, activeFilters]);

  const handleSearch = () => {
    setActiveFilters(pendingFilters);
    setPage(1);
  };

  const handleClear = () => {
    setPendingFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <PageContainer>
      <Title>Transactions</Title>

      <FilterBar>
        <DateFilter
          label="Start Date"
          value={pendingFilters.startDate ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, startDate: value }))}
        />

        <DateFilter
          label="End Date"
          value={pendingFilters.endDate ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, endDate: value }))}
        />

        <TextFilter
          label="Transaction ID"
          placeholder="Search by transaction ID..."
          value={pendingFilters.transactionId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, transactionId: value }))}
        />

        <SelectFilter
          label="Method"
          value={pendingFilters.method ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, method: value }))}
          options={methodOptions}
          placeholder="All methods"
        />

        <SelectFilter
          label="Status"
          value={pendingFilters.status ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, status: value }))}
          options={statusOptions}
          placeholder="All statuses"
        />

        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>Clear</ClearFilterButton>
          <Button style={{ width: 'auto' }} onClick={handleSearch}>Search</Button>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={transactions}
        rowKey="id"
        totalItems={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={newLimit => { setLimit(newLimit); setPage(1); }}
      />

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '1rem' }}>Loading...</div>
      )}
    </PageContainer>
  );
}
