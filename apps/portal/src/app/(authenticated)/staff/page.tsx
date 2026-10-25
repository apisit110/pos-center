'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiStaffRepository } from '../../../infrastructure/repositories/ApiStaffRepository';
import { GetStaffUseCase } from '../../../domain/usecases/GetStaffUseCase';
import { Staff } from '../../../domain/entities/Staff';
import { StaffFilter } from '../../../domain/repositories/StaffRepository';
import { DataTable, FilterBar, TextFilter, SelectFilter, DateRangeFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';
import { useTranslation } from '../../../presentation/i18n/LanguageContext';
import { formatDateTime, getDefaultDateRange, clampToOneYear } from '../../../lib/dayjs';

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
  grid-column: 5;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const SearchCell = styled.div`
  display: flex;
  align-items: flex-start;
  grid-column: 5;
  grid-row: 1;
  /* skip the filter label (line + gap) so the button lines up with the controls */
  padding-top: calc(0.75rem * 1.2 + 0.5rem);

  & > button {
    width: 100%;
    height: 2.3rem;
    margin: 0;
  }
`;


const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.2rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'ACTIVE': return 'rgba(34, 197, 94, 0.15)';
      case 'INACTIVE': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(234, 179, 8, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'ACTIVE': return '#4ade80';
      case 'INACTIVE': return '#f87171';
      default: return '#fbbf24';
    }
  }};
`;

const getEmptyFilters = (): StaffFilter => ({
  ...getDefaultDateRange(),
  merchantId: '',
  role: '',
  username: '',
  status: '',
});

export default function StaffPage() {
  const { t, language } = useTranslation();
  const roleLabel = (role: string) =>
    t.staffRole[role.toLowerCase() as keyof typeof t.staffRole] ?? role.charAt(0).toUpperCase() + role.slice(1);
  const statusLabel = (status: string) =>
    t.staffStatus[status.toLowerCase() as keyof typeof t.staffStatus] ?? status.charAt(0) + status.slice(1).toLowerCase();
  const roleOptions = [
    { value: 'manager', label: t.staffRole.manager },
    { value: 'cashier', label: t.staffRole.cashier },
  ];
  const statusOptions = [
    { value: 'ACTIVE', label: t.staffStatus.active },
    { value: 'PENDING', label: t.staffStatus.pending },
    { value: 'INACTIVE', label: t.staffStatus.inactive },
    { value: 'SUSPENDED', label: t.staffStatus.suspended },
  ];
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<StaffFilter>(getEmptyFilters);
  const [activeFilters, setActiveFilters] = useState<StaffFilter>(getEmptyFilters);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const repository = new ApiStaffRepository();
        const useCase = new GetStaffUseCase(repository);
        const cleanFilters = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== '' && v !== undefined)
        ) as StaffFilter;
        const result = await useCase.execute(page, limit, cleanFilters);
        if (!cancelled) {
          setStaffList(result.staff);
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

  const columns = [
    {
      header: t.staffList.columnName,
      key: 'staff_name',
      render: (s: Staff) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{s.username}</span>
        </div>
      ),
    },
    { header: t.staffList.role, key: 'role', render: (s: Staff) => roleLabel(s.role) },
    {
      header: t.staffList.status,
      key: 'status',
      render: (s: Staff) => (
        <StatusBadge $status={s.status}>
          {statusLabel(s.status)}
        </StatusBadge>
      ),
    },
    { header: t.staffList.columnMerchant, key: 'merchant', render: (s: Staff) => s.merchantName(language) || s.merchantUid },
    {
      header: t.staffList.columnCreatedAt,
      key: 'createdAt',
      render: (s: Staff) => formatDateTime(s.createdAt),
    },
  ];

  return (
    <PageContainer>
      <Title>{t.staffList.title}</Title>

      <FilterBar style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <DateRangeFilter
            label={t.staffList.dateRange}
            value={{ start: pendingFilters.startDate ?? '', end: pendingFilters.endDate ?? '' }}
            onChange={({ start, end }) => setPendingFilters(f => ({ ...f, startDate: clampToOneYear(start), endDate: clampToOneYear(end) }))}
          />
        </div>

        <TextFilter
          label={t.staffList.merchantUid}
          placeholder={t.staffList.merchantUidPlaceholder}
          value={pendingFilters.merchantId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, merchantId: value }))}
        />

        <TextFilter
          label={t.staffList.username}
          placeholder={t.staffList.usernamePlaceholder}
          value={pendingFilters.username ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, username: value }))}
        />

        <SelectFilter
          label={t.staffList.role}
          value={pendingFilters.role ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, role: value }))}
          options={roleOptions}
          placeholder={t.staffList.roleAll}
        />

        <SelectFilter
          label={t.staffList.status}
          value={pendingFilters.status ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, status: value }))}
          options={statusOptions}
          placeholder={t.staffList.statusAll}
        />

        <SearchCell>
          <Button onClick={handleSearch}>{t.common.search}</Button>
        </SearchCell>

        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>{t.common.clear}</ClearFilterButton>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={staffList}
        rowKey="id"
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
