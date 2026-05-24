'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiStaffRepository } from '../../../infrastructure/repositories/ApiStaffRepository';
import { GetStaffUseCase } from '../../../application/use-cases/GetStaffUseCase';
import { Staff } from '../../../domain/entities/Staff';
import { StaffFilter } from '../../../application/repositories/StaffRepository';
import { DataTable, FilterBar, TextFilter, SelectFilter, DateFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';

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
    switch (props.$status) {
      case 'active': return 'rgba(34, 197, 94, 0.15)';
      case 'inactive': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(234, 179, 8, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'active': return '#4ade80';
      case 'inactive': return '#f87171';
      default: return '#fbbf24';
    }
  }};
`;

const roleOptions = [
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending_sync', label: 'Pending Sync' },
];

const EMPTY_FILTERS: StaffFilter = {
  merchantId: '',
  role: '',
  username: '',
  status: '',
  startDate: '',
  endDate: '',
};

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<StaffFilter>(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState<StaffFilter>(EMPTY_FILTERS);

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
    setPendingFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const columns = [
    {
      header: 'Name',
      key: 'staff_name',
      render: (s: Staff) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{s.username}</span>
        </div>
      ),
    },
    { header: 'Role', key: 'role', render: (s: Staff) => s.role.charAt(0).toUpperCase() + s.role.slice(1) },
    {
      header: 'Status',
      key: 'status',
      render: (s: Staff) => (
        <StatusBadge $status={s.status}>
          {s.status === 'pending_sync' ? 'Pending Sync' : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
        </StatusBadge>
      ),
    },
    { header: 'Merchant', key: 'merchant', render: (s: Staff) => s.merchantName || s.merchantUid },
    {
      header: 'Created At',
      key: 'createdAt',
      render: (s: Staff) => s.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  return (
    <PageContainer>
      <Title>Staff Management</Title>

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
          label="Merchant UID"
          placeholder="Enter merchant UID..."
          value={pendingFilters.merchantId ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, merchantId: value }))}
        />

        <TextFilter
          label="Username"
          placeholder="Search by username..."
          value={pendingFilters.username ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, username: value }))}
        />

        <SelectFilter
          label="Role"
          value={pendingFilters.role ?? ''}
          onChange={value => setPendingFilters(f => ({ ...f, role: value }))}
          options={roleOptions}
          placeholder="All roles"
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
        data={staffList}
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
