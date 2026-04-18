'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MockStaffRepository } from '../../../infrastructure/repositories/MockStaffRepository';
import { Staff } from '../../../domain/entities/Staff';
import { DataTable } from '../../../presentation/components/DataTable';

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

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const repository = new MockStaffRepository();
      // Fetching staff for merchant M-123
      const result = await repository.getStaffByMerchant('M-123');
      setStaff(result);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' as const, width: '100px' },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Role', accessor: 'role' as const },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <PageContainer>
      <Title>Staff Management</Title>
      <DataTable 
        columns={columns} 
        data={staff} 
        onRowClick={(s) => console.log('Clicked', s)}
      />
    </PageContainer>
  );
}
