'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GetMembersUseCase } from '../../../domain/usecases/GetMembersUseCase';
import { ApiMemberRepository } from '../../../infrastructure/repositories/ApiMemberRepository';
import { Member } from '../../../domain/entities/Member';
import { MemberFilter } from '../../../domain/repositories/MemberRepository';
import { DataTable, FilterBar, TextFilter, SelectFilter, ClearFilterButton, Button } from '@apisit110/pos-ui';
import { useRouter } from 'next/navigation';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  grid-column: 1 / -1;
  justify-content: flex-end;
  margin-top: 0.5rem;
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
    const repository = new ApiMemberRepository();
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
      key: 'member',
      render: (m: Member) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{m.fullName}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{m.email}</span>
        </div>
      ),
    },
    { header: 'Phone', key: 'phone' },
    { header: 'Tier', key: 'tier', render: (m: Member) => <TierBadge $tier={m.tier}>{m.tier}</TierBadge> },
    {
      header: 'Points',
      key: 'points',
      render: (m: Member) => (
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {m.points.toLocaleString()} pts
        </span>
      ),
    },
    { header: 'Joined', key: 'joined', render: (m: Member) => m.createdAt.toLocaleDateString() },
  ];

  return (
    <PageContainer>
      <FilterBar>
        <div style={{ gridColumn: 'span 2' }}>
          <TextFilter
            label="Search Member"
            placeholder="Search by name, email or phone..."
            value={filters.query}
            onChange={(value) => setFilters({ ...filters, query: value })}
          />
        </div>

        <SelectFilter
          label="Tier"
          value={filters.tier?.[0] ?? ''}
          onChange={(value) => setFilters({ ...filters, tier: value ? [value] : [] })}
          options={tierOptions}
          placeholder="All tiers"
        />

        <ButtonGroup>
          <ClearFilterButton onClick={handleClear}>Clear</ClearFilterButton>
          <Button style={{ width: 'auto' }} onClick={handleSearch}>Search</Button>
        </ButtonGroup>
      </FilterBar>

      <DataTable
        columns={columns}
        data={members}
        onRowClick={(member) => console.log('Member clicked:', member)}
        totalItems={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
      />
    </PageContainer>
  );
}
