'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { RegisterMerchantUseCase } from '../../../../domain/usecases/RegisterMerchantUseCase';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { InputField, SelectFilter, Button } from '@apisit110/pos-ui';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
`;

const FormCard = styled.div`
  background: var(--bg-card);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TerminalInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  color: white;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const StoreCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const TerminalRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  align-items: center;
`;


type StaffRole = 'manager' | 'cashier';

interface StaffEntry {
  fullName: string;
  pin: string;
  confirmPin: string;
  role: StaffRole;
}

export default function CreateMerchantPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffEntry[]>([
    { fullName: '', pin: '', confirmPin: '', role: 'manager' },
  ]);
  const [stores, setStores] = useState([{ name: '', address: '', latitude: 0, longitude: 0, terminals: [{ name: '' }] }]);

  const addStaff = () => {
    setStaffMembers([...staffMembers, { fullName: '', pin: '', confirmPin: '', role: 'cashier' }]);
  };

  const removeStaff = (index: number) => {
    setStaffMembers(staffMembers.filter((_, i) => i !== index));
  };

  const updateStaff = (index: number, field: keyof StaffEntry, value: string) => {
    const updated = [...staffMembers];
    (updated[index] as any)[field] = value;
    setStaffMembers(updated);
  };

  const addStore = () => {
    setStores([...stores, { name: '', address: '', latitude: 0, longitude: 0, terminals: [{ name: '' }] }]);
  };

  const removeStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  const updateStore = (index: number, field: string, value: any) => {
    const newStores = [...stores];
    (newStores[index] as any)[field] = value;
    setStores(newStores);
  };

  const addTerminal = (storeIndex: number) => {
    const newStores = [...stores];
    newStores[storeIndex].terminals.push({ name: '' });
    setStores(newStores);
  };

  const removeTerminal = (storeIndex: number, terminalIndex: number) => {
    const newStores = [...stores];
    newStores[storeIndex].terminals = newStores[storeIndex].terminals.filter((_, i) => i !== terminalIndex);
    setStores(newStores);
  };

  const updateTerminal = (storeIndex: number, terminalIndex: number, value: string) => {
    const newStores = [...stores];
    newStores[storeIndex].terminals[terminalIndex].name = value;
    setStores(newStores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const staff of staffMembers) {
      if (staff.pin !== staff.confirmPin) {
        alert(`PIN and Confirm PIN do not match for "${staff.fullName || 'a staff member'}"`);
        return;
      }
    }

    if (!staffMembers.some(s => s.role === 'manager')) {
      alert('At least one staff member must have the Manager role');
      return;
    }

    try {
      const repository = new ApiMerchantRepository();
      const useCase = new RegisterMerchantUseCase(repository);
      await useCase.execute({
        merchantName,
        staffMembers: staffMembers.map(({ confirmPin, ...s }) => s),
        stores,
      });
      router.push('/merchants');
      router.refresh();
    } catch (error) {
      console.error('Failed to create merchant', error);
      alert('Failed to create merchant');
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Create New Merchant</Title>
        <Button variant="secondary" style={{ width: 'auto' }} onClick={() => router.push('/merchants')}>Back</Button>
      </Header>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Merchant Name"
            required
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="Enter merchant name"
          />

          <SectionTitle>
            Staff
            <Button type="button" variant="secondary" style={{ width: 'auto' }} onClick={addStaff}>+ Add Staff</Button>
          </SectionTitle>

          {staffMembers.map((staff, sIdx) => (
            <StoreCard key={sIdx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Staff #{sIdx + 1}</h4>
                {staffMembers.length > 1 && (
                  <Button type="button" variant="danger" style={{ width: 'auto' }} onClick={() => removeStaff(sIdx)}>Remove</Button>
                )}
              </div>

              <SelectFilter
                label="Role"
                value={staff.role}
                onChange={(value) => updateStaff(sIdx, 'role', value)}
                options={[
                  { value: 'manager', label: 'Manager' },
                  { value: 'cashier', label: 'Cashier' },
                ]}
              />

              <InputField
                label="Full Name"
                required
                value={staff.fullName}
                onChange={(e) => updateStaff(sIdx, 'fullName', e.target.value)}
                placeholder="Full name"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField
                  label="PIN"
                  required
                  type="password"
                  value={staff.pin}
                  onChange={(e) => updateStaff(sIdx, 'pin', e.target.value)}
                  placeholder="Enter PIN"
                />
                <InputField
                  label="Confirm PIN"
                  required
                  type="password"
                  value={staff.confirmPin}
                  onChange={(e) => updateStaff(sIdx, 'confirmPin', e.target.value)}
                  placeholder="Confirm PIN"
                />
              </div>
            </StoreCard>
          ))}

          <SectionTitle>
            Stores
            <Button type="button" variant="secondary" style={{ width: 'auto' }} onClick={addStore}>+ Add Store</Button>
          </SectionTitle>

          {stores.map((store, sIdx) => (
            <StoreCard key={sIdx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Store #{sIdx + 1}</h4>
                {stores.length > 1 && (
                  <Button type="button" variant="danger" style={{ width: 'auto' }} onClick={() => removeStore(sIdx)}>Remove</Button>
                )}
              </div>

              <InputField
                label="Store Name"
                required
                value={store.name}
                onChange={(e) => updateStore(sIdx, 'name', e.target.value)}
                placeholder="Store name"
              />

              <InputField
                label="Address"
                required
                value={store.address}
                onChange={(e) => updateStore(sIdx, 'address', e.target.value)}
                placeholder="Store address"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField
                  label="Latitude"
                  type="number"
                  step="any"
                  value={store.latitude}
                  onChange={(e) => updateStore(sIdx, 'latitude', parseFloat(e.target.value))}
                />
                <InputField
                  label="Longitude"
                  type="number"
                  step="any"
                  value={store.longitude}
                  onChange={(e) => updateStore(sIdx, 'longitude', parseFloat(e.target.value))}
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-sub)' }}>Terminals</span>
                  <Button type="button" variant="secondary" style={{ width: 'auto' }} onClick={() => addTerminal(sIdx)}>+ Add Terminal</Button>
                </div>
                {store.terminals.map((terminal, tIdx) => (
                  <TerminalRow key={tIdx}>
                    <TerminalInput
                      required
                      value={terminal.name}
                      onChange={(e) => updateTerminal(sIdx, tIdx, e.target.value)}
                      placeholder="Terminal Name"
                    />
                    {store.terminals.length > 1 && (
                      <Button type="button" variant="danger" style={{ width: 'auto' }} onClick={() => removeTerminal(sIdx, tIdx)}>&times;</Button>
                    )}
                  </TerminalRow>
                ))}
              </div>
            </StoreCard>
          ))}

          <Button type="submit" style={{ marginTop: '1rem' }}>Create Merchant</Button>
        </form>
      </FormCard>
    </PageContainer>
  );
}
