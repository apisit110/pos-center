'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GetMembersUseCase } from '../../../application/use-cases/GetMembersUseCase';
import { MockMemberRepository } from '../../../infrastructure/repositories/MockMemberRepository';
import { Member } from '../../../domain/entities/Member';
import { MemberFilter } from '../../../application/repositories/MemberRepository';
import { DataTable } from '../../../presentation/components/DataTable';
import { Pagination } from '../../../presentation/components/Pagination';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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

const ActionButton = styled.button<{ $variant?: 'secondary' | 'primary' }>`
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

const TierBadge = styled.span<{ $tier: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$tier) {
      case 'Platinum': return 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)';
      case 'Gold': return 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)';
      case 'Silver': return 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)';
      default: return 'linear-gradient(135deg, #92400e 0%, #78350f 100%)';
    }
  }};
  color: ${props => props.$tier === 'Platinum' ? '#1e293b' : 'white'};
`;

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'var(--border)',
    borderRadius: '0.5rem',
    minHeight: '42px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'var(--primary)',
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    zIndex: 20
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
    '&:active': {
      background: 'var(--primary)',
    }
  }),
  multiValue: (base: any) => ({
    ...base,
    background: 'var(--primary)',
    borderRadius: '4px',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'white',
    fontSize: '0.8rem',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'white',
    '&:hover': {
      background: 'var(--primary-hover)',
      color: 'white',
    }
  }),
  input: (base: any) => ({
    ...base,
    color: 'white',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--text-sub)',
    fontSize: '0.9rem'
  })
};

const tierOptions = [
  { value: 'Bronze', label: 'Bronze' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Platinum', label: 'Platinum' },
];

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [filters, setFilters] = useState<MemberFilter>({
    query: '',
    tier: []
  });

  const fetchMembers = useCallback(async (activeFilters: MemberFilter) => {
    const repository = new MockMemberRepository();
    const useCase = new GetMembersUseCase(repository);
    const result = await useCase.execute(page, limit, activeFilters);
    setMembers(result.members);
    setTotal(result.total);
  }, [page, limit]);

  useEffect(() => {
    fetchMembers(filters);
  }, [page, limit, fetchMembers]);

  const handleSearch = () => {
    setPage(1);
    fetchMembers(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      query: '',
      tier: []
    };
    setFilters(clearedFilters);
    setPage(1);
    fetchMembers(clearedFilters);
  };

  const columns = [
    { 
      header: 'Name', 
      accessor: (m: Member) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{m.fullName}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{m.email}</span>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as const },
    { 
      header: 'Tier', 
      accessor: (m: Member) => <TierBadge $tier={m.tier}>{m.tier}</TierBadge> 
    },
    { 
      header: 'Points', 
      accessor: (m: Member) => (
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {m.points.toLocaleString()} pts
        </span>
      )
    },
    { 
      header: 'Joined', 
      accessor: (m: Member) => m.createdAt.toLocaleDateString() 
    },
  ];

  return (
    <PageContainer>
      <FilterSection>
        <FormGroup style={{ gridColumn: 'span 2' }}>
          <Label>Search Member</Label>
          <Input 
            placeholder="Search by name, email or phone..." 
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </FormGroup>

        <FormGroup>
          <Label>Tier</Label>
          <Select
            isMulti
            options={tierOptions}
            styles={selectStyles}
            value={tierOptions.filter(opt => filters.tier?.includes(opt.value))}
            onChange={(selected) => {
              setFilters({ ...filters, tier: (selected as any[]).map(s => s.value) });
            }}
            placeholder="Select tiers..."
          />
        </FormGroup>

        <ButtonGroup>
          <ActionButton $variant="secondary" onClick={handleClear}>Clear</ActionButton>
          <ActionButton onClick={handleSearch}>Search</ActionButton>
        </ButtonGroup>
      </FilterSection>

      <DataTable 
        columns={columns} 
        data={members} 
        onRowClick={(member) => console.log('Member clicked:', member)}
        footer={
          <Pagination 
            total={total} 
            page={page} 
            limit={limit} 
            onPageChange={setPage} 
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }} 
          />
        } 
      />
    </PageContainer>
  );
}
