'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { RegisterMerchantUseCase } from '../../../../application/use-cases/RegisterMerchantUseCase';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';

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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-sub);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  option {
    background: #1e293b;
    color: white;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  width: auto;
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    if (props.$variant === 'danger') return '#ef4444';
    if (props.$variant === 'secondary') return 'rgba(255, 255, 255, 0.05)';
    return 'var(--primary)';
  }};
  color: white;
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--border)' : 'none'};

  &:hover {
    background: ${props => {
      if (props.$variant === 'danger') return '#dc2626';
      if (props.$variant === 'secondary') return 'rgba(255, 255, 255, 0.1)';
      return 'var(--primary-hover)';
    }};
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

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

type StaffRole = 'manager' | 'cashier';

interface StaffEntry {
  username: string;
  fullName: string;
  pin: string;
  confirmPin: string;
  role: StaffRole;
}

export default function CreateMerchantPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffEntry[]>([
    { username: '', fullName: '', pin: '', confirmPin: '', role: 'manager' },
  ]);
  const [stores, setStores] = useState([{ name: '', address: '', latitude: 0, longitude: 0, terminals: [{ name: '' }] }]);

  const addStaff = () => {
    setStaffMembers([...staffMembers, { username: '', fullName: '', pin: '', confirmPin: '', role: 'cashier' }]);
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
        alert(`PIN and Confirm PIN do not match for "${staff.username || 'a staff member'}"`);
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
        <ActionButton $variant="secondary" onClick={() => router.push('/merchants')}>Back</ActionButton>
      </Header>

      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Merchant Name</Label>
            <Input
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Enter merchant name"
            />
          </FormGroup>

          <SectionTitle>
            Staff
            <ActionButton type="button" $variant="secondary" onClick={addStaff}>+ Add Staff</ActionButton>
          </SectionTitle>

          {staffMembers.map((staff, sIdx) => (
            <StoreCard key={sIdx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Staff #{sIdx + 1}</h4>
                {staffMembers.length > 1 && (
                  <ActionButton type="button" $variant="danger" onClick={() => removeStaff(sIdx)}>Remove</ActionButton>
                )}
              </div>

              <FormGroup>
                <Label>Role</Label>
                <Select
                  value={staff.role}
                  onChange={(e) => updateStaff(sIdx, 'role', e.target.value)}
                >
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Username</Label>
                <Input
                  required
                  value={staff.username}
                  onChange={(e) => updateStaff(sIdx, 'username', e.target.value)}
                  placeholder="Login username"
                />
              </FormGroup>

              <FormGroup>
                <Label>Full Name</Label>
                <Input
                  required
                  value={staff.fullName}
                  onChange={(e) => updateStaff(sIdx, 'fullName', e.target.value)}
                  placeholder="Full name"
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>PIN</Label>
                  <Input
                    required
                    type="password"
                    value={staff.pin}
                    onChange={(e) => updateStaff(sIdx, 'pin', e.target.value)}
                    placeholder="Enter PIN"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Confirm PIN</Label>
                  <Input
                    required
                    type="password"
                    value={staff.confirmPin}
                    onChange={(e) => updateStaff(sIdx, 'confirmPin', e.target.value)}
                    placeholder="Confirm PIN"
                  />
                </FormGroup>
              </div>
            </StoreCard>
          ))}

          <SectionTitle>
            Stores
            <ActionButton type="button" $variant="secondary" onClick={addStore}>+ Add Store</ActionButton>
          </SectionTitle>

          {stores.map((store, sIdx) => (
            <StoreCard key={sIdx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Store #{sIdx + 1}</h4>
                {stores.length > 1 && (
                  <ActionButton type="button" $variant="danger" onClick={() => removeStore(sIdx)}>Remove</ActionButton>
                )}
              </div>

              <FormGroup>
                <Label>Store Name</Label>
                <Input
                  required
                  value={store.name}
                  onChange={(e) => updateStore(sIdx, 'name', e.target.value)}
                  placeholder="Store name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Address</Label>
                <Input
                  required
                  value={store.address}
                  onChange={(e) => updateStore(sIdx, 'address', e.target.value)}
                  placeholder="Store address"
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={store.latitude}
                    onChange={(e) => updateStore(sIdx, 'latitude', parseFloat(e.target.value))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={store.longitude}
                    onChange={(e) => updateStore(sIdx, 'longitude', parseFloat(e.target.value))}
                  />
                </FormGroup>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Label style={{ marginBottom: 0 }}>Terminals</Label>
                  <ActionButton type="button" $variant="secondary" onClick={() => addTerminal(sIdx)}>+ Add Terminal</ActionButton>
                </div>
                {store.terminals.map((terminal, tIdx) => (
                  <TerminalRow key={tIdx}>
                    <Input
                      required
                      value={terminal.name}
                      onChange={(e) => updateTerminal(sIdx, tIdx, e.target.value)}
                      placeholder="Terminal Name"
                      style={{ marginBottom: 0 }}
                    />
                    {store.terminals.length > 1 && (
                      <ActionButton type="button" $variant="danger" onClick={() => removeTerminal(sIdx, tIdx)}>&times;</ActionButton>
                    )}
                  </TerminalRow>
                ))}
              </div>
            </StoreCard>
          ))}

          <SubmitButton type="submit">Create Merchant</SubmitButton>
        </form>
      </FormCard>
    </PageContainer>
  );
}
