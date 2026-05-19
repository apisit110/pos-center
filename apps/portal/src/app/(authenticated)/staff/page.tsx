'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { ApiStaffRepository } from '../../../infrastructure/repositories/ApiStaffRepository';
import { GetStaffUseCase } from '../../../application/use-cases/GetStaffUseCase';
import { Staff } from '../../../domain/entities/Staff';
import { StaffFilter } from '../../../application/repositories/StaffRepository';
import { DataTable } from '../../../presentation/components/DataTable';
import { Pagination } from '../../../presentation/components/Pagination';

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

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
`;

const Input = styled.input`
  margin-bottom: 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  background: rgba(15, 23, 42, 0.5);
  &:focus {
    outline: 2px solid var(--primary);
    border-color: transparent;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'secondary' }>`
  width: auto;
  min-width: 120px;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)'};
  color: white;
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--border)' : 'none'};

  &:hover {
    background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary-hover)'};
  }
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

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'var(--border)',
    borderRadius: '0.5rem',
    minHeight: '42px',
    boxShadow: 'none',
    '&:hover': { borderColor: 'var(--primary)' },
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    zIndex: 20,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    '&:active': { background: 'var(--primary)' },
  }),
  singleValue: (base: any) => ({ ...base, color: 'white' }),
  input: (base: any) => ({ ...base, color: 'white' }),
  placeholder: (base: any) => ({ ...base, color: 'var(--text-sub)', fontSize: '0.9rem' }),
};

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

  const fetchStaff = useCallback(async (filters: StaffFilter, currentPage: number, currentLimit: number) => {
    setLoading(true);
    try {
      const repository = new ApiStaffRepository();
      const useCase = new GetStaffUseCase(repository);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
      ) as StaffFilter;
      const result = await useCase.execute(currentPage, currentLimit, cleanFilters);
      setStaffList(result.staff);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(activeFilters, page, limit);
  }, [page, limit, fetchStaff, activeFilters]);

  const handleSearch = () => {
    setActiveFilters(pendingFilters);
    setPage(1);
    fetchStaff(pendingFilters, 1, limit);
  };

  const handleClear = () => {
    setPendingFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    fetchStaff(EMPTY_FILTERS, 1, limit);
  };

  const columns = [
    {
      header: 'Name',
      accessor: (s: Staff) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{s.username}</span>
        </div>
      ),
    },
    { header: 'Role', accessor: (s: Staff) => s.role.charAt(0).toUpperCase() + s.role.slice(1) },
    {
      header: 'Status',
      accessor: (s: Staff) => (
        <StatusBadge $status={s.status}>
          {s.status === 'pending_sync' ? 'Pending Sync' : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
        </StatusBadge>
      ),
    },
    { header: 'Merchant', accessor: (s: Staff) => s.merchantName || s.merchantUid },
    {
      header: 'Created At',
      accessor: (s: Staff) => s.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  return (
    <PageContainer>
      <Title>Staff Management</Title>

      <FilterSection>
        <FormGroup>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={pendingFilters.startDate ?? ''}
            onChange={e => setPendingFilters(f => ({ ...f, startDate: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <Label>End Date</Label>
          <Input
            type="date"
            value={pendingFilters.endDate ?? ''}
            onChange={e => setPendingFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <Label>Merchant UID</Label>
          <Input
            placeholder="Enter merchant UID..."
            value={pendingFilters.merchantId ?? ''}
            onChange={e => setPendingFilters(f => ({ ...f, merchantId: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>

        <FormGroup>
          <Label>Username</Label>
          <Input
            placeholder="Search by username..."
            value={pendingFilters.username ?? ''}
            onChange={e => setPendingFilters(f => ({ ...f, username: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>

        <FormGroup>
          <Label>Role</Label>
          <Select
            instanceId="role-select"
            isClearable
            options={roleOptions}
            styles={selectStyles}
            value={roleOptions.find(o => o.value === pendingFilters.role) ?? null}
            onChange={selected => setPendingFilters(f => ({ ...f, role: selected?.value ?? '' }))}
            placeholder="All roles..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <Select
            instanceId="status-select"
            isClearable
            options={statusOptions}
            styles={selectStyles}
            value={statusOptions.find(o => o.value === pendingFilters.status) ?? null}
            onChange={selected => setPendingFilters(f => ({ ...f, status: selected?.value ?? '' }))}
            placeholder="All statuses..."
          />
        </FormGroup>

        <ButtonGroup>
          <ActionButton $variant="secondary" onClick={handleClear}>Clear</ActionButton>
          <ActionButton onClick={handleSearch}>Search</ActionButton>
        </ButtonGroup>
      </FilterSection>

      <DataTable
        columns={columns}
        data={staffList}
        footer={
          <Pagination
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={newLimit => { setLimit(newLimit); setPage(1); }}
          />
        }
      />

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '1rem' }}>Loading...</div>
      )}
    </PageContainer>
  );
}
