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
import { GetMerchantsUseCase } from '../../../domain/usecases/GetMerchantsUseCase';
import { GetStoresUseCase } from '../../../domain/usecases/GetStoresUseCase';
import { ApiMerchantRepository } from '../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../infrastructure/repositories/ApiStoreRepository';
import { useTranslation } from '../../../presentation/i18n/LanguageContext';
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
  merchantId: '',
  storeId: '',
});

const statusValues = ['pending', 'approved', 'failed', 'voided', 'refunded'];

export default function TransactionsPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const methodOptions = [
    { value: 'cash', label: t.transactionList.methodCash },
    { value: 'qr', label: t.transactionList.methodQr },
  ];
  const statusOptions = statusValues.map(value => ({
    value,
    label: t.transactionStatus[value as keyof typeof t.transactionStatus],
  }));
  const methodLabels = Object.fromEntries(methodOptions.map(o => [o.value, o.label]));
  const columns = [
    { header: t.transactionList.columnDate, key: 'createdAt', render: (tx: Transaction) => formatDateTime(tx.createdAt) },
    {
      header: t.transactionList.transactionId,
      key: 'id',
      render: (tx: Transaction) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tx.id}</span>
      ),
    },
    {
      header: t.transactionList.orderId,
      key: 'orderId',
      render: (tx: Transaction) => (
        <span style={{ fontFamily: 'monospace' }}>{tx.orderId || '-'}</span>
      ),
    },
    {
      header: t.transactionList.method,
      key: 'paymentMethod',
      render: (tx: Transaction) => methodLabels[tx.paymentMethod] ?? tx.paymentMethod,
    },
    {
      header: t.transactionList.columnAmount,
      key: 'amount',
      render: (tx: Transaction) => (
        <span style={{ fontWeight: 600 }}>
          {formatAmount(tx.amount)} {tx.currency}
        </span>
      ),
    },
    { header: t.transactionList.store, key: 'storeName', render: (tx: Transaction) => tx.storeName(language) || '-' },
    {
      header: t.transactionList.status,
      key: 'status',
      render: (tx: Transaction) => <TransactionStatusBadge status={tx.status} />,
    },
  ];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<TransactionFilter>(getEmptyFilters);
  const [activeFilters, setActiveFilters] = useState<TransactionFilter>(getEmptyFilters);

  const [merchants, setMerchants] = useState<{ value: string; label: string }[]>([]);
  const [stores, setStores] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const merchantData = await new GetMerchantsUseCase(new ApiMerchantRepository()).execute(1, 100);
      setMerchants(merchantData.merchants.map(m => ({ value: m.uid, label: m.displayName(language) })));
      const storeData = await new GetStoresUseCase(new ApiStoreRepository()).execute();
      setStores(storeData.map(s => ({ value: s.uid, label: s.displayName(language) })));
    };
    loadOptions();
  }, [language]);

  const handleMerchantChange = async (merchantId: string) => {
    setPendingFilters(f => ({ ...f, merchantId, storeId: '' }));
    const storeData = await new GetStoresUseCase(new ApiStoreRepository()).execute(merchantId || undefined);
    setStores(storeData.map(s => ({ value: s.uid, label: s.displayName(language) })));
  };

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
    new GetStoresUseCase(new ApiStoreRepository()).execute().then(data =>
      setStores(data.map(s => ({ value: s.uid, label: s.displayName(language) })))
    );
  };

  return (
    <PageContainer>
      <Title>{t.transactionList.title}</Title>

      <FilterBar style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <DateRangeFilter
            label={t.transactionList.dateRange}
            value={{ start: pendingFilters.startDate ?? '', end: pendingFilters.endDate ?? '' }}
            onChange={({ start, end }) => setPendingFilters(f => ({ ...f, startDate: clampToOneYear(start), endDate: clampToOneYear(end) }))}
          />
        </div>

        <TextFilter
          label={t.transactionList.transactionId}
          placeholder={t.transactionList.transactionIdPlaceholder}
          value={pendingFilters.transactionId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, transactionId: value }))}
        />

        <TextFilter
          label={t.transactionList.orderId}
          placeholder={t.transactionList.orderIdPlaceholder}
          value={pendingFilters.orderId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, orderId: value }))}
        />

        <SearchCell>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </SearchCell>

        <SelectFilter
          label={t.transactionList.method}
          value={pendingFilters.method ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, method: value }))}
          options={methodOptions}
          placeholder={t.transactionList.methodAll}
        />

        <SelectFilter
          label={t.transactionList.status}
          value={pendingFilters.status ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, status: value }))}
          options={statusOptions}
          placeholder={t.transactionList.statusAll}
        />

        <SelectFilter
          label={t.transactionList.merchant}
          value={pendingFilters.merchantId ?? ''}
          onChange={handleMerchantChange}
          options={merchants}
          placeholder={t.transactionList.merchantAll}
        />

        <SelectFilter
          label={t.transactionList.store}
          value={pendingFilters.storeId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, storeId: value }))}
          options={stores}
          placeholder={t.transactionList.storeAll}
        />

        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>{t.common.clear}</ClearFilterButton>
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
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '1rem' }}>{t.common.loading}</div>
      )}
    </PageContainer>
  );
}
