'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { formatDateTime, getDefaultDateRange, clampToOneYear } from '../../../lib/dayjs';
import { formatAmount } from '../../../lib/formatAmount';
import { DataTable, FilterBar, TextFilter, SelectFilter, DateRangeFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';
import { GetTransactionsUseCase } from '../../../domain/usecases/GetTransactionsUseCase';
import { ApiTransactionRepository } from '../../../infrastructure/repositories/ApiTransactionRepository';
import { TransactionStatusBadge } from '../../../presentation/components/TransactionStatusBadge';
import { Transaction } from '../../../domain/entities/Transaction';
import { TransactionFilter } from '../../../domain/repositories/TransactionRepository';

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
  grid-column: 5;
  /* skip the filter label (line + gap) so the button lines up with the controls */
  padding-top: calc(0.75rem * 1.2 + 0.5rem);

  & > button {
    width: 100%;
    height: 2.3rem;
    margin: 0;
  }
`;

const SearchCell = styled.div`
  display: flex;
  align-items: flex-start;
  /* skip the filter label (line + gap) so the button lines up with the controls */
  padding-top: calc(0.75rem * 1.2 + 0.5rem);

  & > button {
    width: 100%;
    height: 2.3rem;
    margin: 0;
  }
`;

const getEmptyFilters = (): TransactionFilter => ({
  ...getDefaultDateRange(),
  transactionId: '',
  orderId: '',
  method: '',
  status: '',
});

const methodOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'qr', label: 'QR' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'failed', label: 'Failed' },
  { value: 'voided', label: 'Voided' },
  { value: 'refunded', label: 'Refunded' },
];

const methodLabels = Object.fromEntries(methodOptions.map(o => [o.value, o.label]));

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
    header: 'Order ID',
    key: 'orderId',
    render: (tx: Transaction) => (
      <span style={{ fontFamily: 'monospace' }}>{tx.orderId || '-'}</span>
    ),
  },
  {
    header: 'Method',
    key: 'paymentMethod',
    render: (tx: Transaction) => methodLabels[tx.paymentMethod] ?? tx.paymentMethod,
  },
  {
    header: 'Amount',
    key: 'amount',
    render: (tx: Transaction) => (
      <span style={{ fontWeight: 600 }}>
        {formatAmount(tx.amount)} {tx.currency}
      </span>
    ),
  },
  { header: 'Store', key: 'storeName' },
  {
    header: 'Status',
    key: 'status',
    render: (tx: Transaction) => (
      <TransactionStatusBadge status={tx.status} />
    ),
  },
];

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<TransactionFilter>(getEmptyFilters);
  const [activeFilters, setActiveFilters] = useState<TransactionFilter>(getEmptyFilters);

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
    setPendingFilters(getEmptyFilters());
    setActiveFilters(getEmptyFilters());
    setPage(1);
  };

  return (
    <PageContainer>
      <Title>Transactions</Title>

      <FilterBar style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <DateRangeFilter
            label="Date Range"
            value={{ start: pendingFilters.startDate ?? '', end: pendingFilters.endDate ?? '' }}
            onChange={({ start, end }) => setPendingFilters(f => ({ ...f, startDate: clampToOneYear(start), endDate: clampToOneYear(end) }))}
          />
        </div>

        <TextFilter
          label="Transaction ID"
          placeholder="Search by transaction ID..."
          value={pendingFilters.transactionId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, transactionId: value }))}
        />

        <TextFilter
          label="Order ID"
          placeholder="Search by order ID..."
          value={pendingFilters.orderId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, orderId: value }))}
        />

        <SearchCell>
          <Button onClick={handleSearch}>Search</Button>
        </SearchCell>

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
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={transactions}
        rowKey="id"
        onRowClick={(tx) => router.push(`/transactions/${tx.id}`)}
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
