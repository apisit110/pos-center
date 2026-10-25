'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { RegisterMerchantUseCase } from '../../../../domain/usecases/RegisterMerchantUseCase';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiMasterDataRepository } from '../../../../infrastructure/repositories/ApiMasterDataRepository';
import { AddressRequest } from '../../../../domain/repositories/MerchantRepository';
import { MasterDataRef } from '../../../../domain/entities/Store';
import { pickName } from '../../../../domain/entities/LocalizedName';
import { useTranslation } from '../../../../presentation/i18n/LanguageContext';
import { InputField, PinInputField, SelectFilter, Button } from '@apisit110/pos-ui';

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
  background: var(--bg-card);
  color: var(--text-main);
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

interface StoreEntry {
  nameEn: string;
  nameTh: string;
  registeredAddress: AddressRequest;
  /** when true, the registered address is also sent as the contract address */
  contractSameAsRegistered: boolean;
  contractAddress: AddressRequest;
  terminals: { nameEn: string; nameTh: string }[];
}

const emptyAddress = (): AddressRequest => ({
  address1: '',
  provinceCode: '',
  districtCode: '',
  subDistrictCode: '',
  postalCode: '',
  latitude: '',
  longitude: '',
});

const emptyStore = (): StoreEntry => ({
  nameEn: '',
  nameTh: '',
  registeredAddress: emptyAddress(),
  contractSameAsRegistered: true,
  contractAddress: emptyAddress(),
  terminals: [{ nameEn: '', nameTh: '' }],
});

type Option = { value: string; label: string };

const masterDataRepository = new ApiMasterDataRepository();

/** select options of one master data level, reloaded when the parent code changes (empty while no parent) */
function useMasterDataOptions(parentCode: string, load: (code: string) => Promise<Option[]>): Option[] {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    setOptions([]);
    if (!parentCode) return;
    let cancelled = false;
    load(parentCode).then((loaded) => { if (!cancelled) setOptions(loaded); }).catch(() => {});
    return () => { cancelled = true; };
  }, [parentCode]);
  return options;
}

/** address by master data (province -> district -> sub district -> postal code) */
function AddressFields({ title, value, onChange, provinceOptions, language }: {
  title: string;
  value: AddressRequest;
  onChange: (value: AddressRequest) => void;
  provinceOptions: Option[];
  language: 'en' | 'th';
}) {
  const toOptions = (refs: MasterDataRef[]) => refs.map((r) => ({ value: r.code, label: pickName(language, r.nameEn, r.nameTh) }));
  const districtOptions = useMasterDataOptions(value.provinceCode, async (code) => toOptions(await masterDataRepository.getDistricts(code)));
  const subDistrictOptions = useMasterDataOptions(value.districtCode, async (code) => toOptions(await masterDataRepository.getSubDistricts(code)));
  const postalCodeOptions = useMasterDataOptions(value.subDistrictCode, async (code) =>
    (await masterDataRepository.getPostalCodes(code)).map((c) => ({ value: c, label: c })));

  // a sub district usually has one postal code: select it
  useEffect(() => {
    if (postalCodeOptions.length === 1 && value.postalCode !== postalCodeOptions[0].value) {
      onChange({ ...value, postalCode: postalCodeOptions[0].value });
    }
  }, [postalCodeOptions]);

  const set = (field: 'address1' | 'latitude' | 'longitude') => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });

  return (
    <div>
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-sub)' }}>{title}</span>
      <InputField label="Address" value={value.address1} onChange={set('address1')} placeholder="House no., building, road" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <SelectFilter
          label="Province"
          value={value.provinceCode}
          options={provinceOptions}
          placeholder="Select province"
          // a new parent clears the levels below it
          onChange={(provinceCode) => onChange({ ...value, provinceCode, districtCode: '', subDistrictCode: '', postalCode: '' })}
        />
        <SelectFilter
          label="District"
          value={value.districtCode}
          options={districtOptions}
          placeholder="Select district"
          disabled={!value.provinceCode}
          onChange={(districtCode) => onChange({ ...value, districtCode, subDistrictCode: '', postalCode: '' })}
        />
        <SelectFilter
          label="Sub District"
          value={value.subDistrictCode}
          options={subDistrictOptions}
          placeholder="Select sub district"
          disabled={!value.districtCode}
          onChange={(subDistrictCode) => onChange({ ...value, subDistrictCode, postalCode: '' })}
        />
        <SelectFilter
          label="Postal Code"
          value={value.postalCode}
          options={postalCodeOptions}
          placeholder="Select postal code"
          disabled={!value.subDistrictCode}
          onChange={(postalCode) => onChange({ ...value, postalCode })}
        />
        <InputField label="Latitude" type="number" step="any" value={value.latitude} onChange={set('latitude')} />
        <InputField label="Longitude" type="number" step="any" value={value.longitude} onChange={set('longitude')} />
      </div>
    </div>
  );
}

const isAddressComplete = (a: AddressRequest) => Boolean(a.provinceCode && a.districtCode && a.subDistrictCode && a.postalCode);

export default function CreateMerchantPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const [provinces, setProvinces] = useState<MasterDataRef[]>([]);
  const [merchantNameEn, setMerchantNameEn] = useState('');
  const [merchantNameTh, setMerchantNameTh] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffEntry[]>([
    { fullName: '', pin: '', confirmPin: '', role: 'manager' },
  ]);
  const [stores, setStores] = useState<StoreEntry[]>([emptyStore()]);

  useEffect(() => {
    masterDataRepository.getProvinces().then(setProvinces).catch(() => alert('Failed to load provinces'));
  }, []);
  const provinceOptions = provinces.map((p) => ({ value: p.code, label: pickName(language, p.nameEn, p.nameTh) }));

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
    setStores([...stores, emptyStore()]);
  };

  const removeStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  const updateStore = <K extends keyof StoreEntry>(index: number, field: K, value: StoreEntry[K]) => {
    setStores(stores.map((store, i) => (i === index ? { ...store, [field]: value } : store)));
  };

  const addTerminal = (storeIndex: number) => {
    updateStore(storeIndex, 'terminals', [...stores[storeIndex].terminals, { nameEn: '', nameTh: '' }]);
  };

  const removeTerminal = (storeIndex: number, terminalIndex: number) => {
    updateStore(storeIndex, 'terminals', stores[storeIndex].terminals.filter((_, i) => i !== terminalIndex));
  };

  const updateTerminal = (storeIndex: number, terminalIndex: number, field: 'nameEn' | 'nameTh', value: string) => {
    updateStore(
      storeIndex,
      'terminals',
      stores[storeIndex].terminals.map((terminal, i) => (i === terminalIndex ? { ...terminal, [field]: value } : terminal)),
    );
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

    for (const store of stores) {
      const addresses = store.contractSameAsRegistered ? [store.registeredAddress] : [store.registeredAddress, store.contractAddress];
      if (!addresses.every(isAddressComplete)) {
        alert(`Please select province, district, sub district and postal code for "${store.nameEn || 'a store'}"`);
        return;
      }
      if (addresses.some((a) => (a.latitude === '') !== (a.longitude === ''))) {
        alert(`Latitude and longitude must be both filled or both empty for "${store.nameEn || 'a store'}"`);
        return;
      }
    }

    try {
      const repository = new ApiMerchantRepository();
      const useCase = new RegisterMerchantUseCase(repository);
      await useCase.execute({
        merchantNameEn,
        merchantNameTh,
        staffMembers: staffMembers.map(({ confirmPin, ...s }) => s),
        stores: stores.map(({ contractSameAsRegistered, contractAddress, ...store }) => ({
          ...store,
          contractAddress: contractSameAsRegistered ? store.registeredAddress : contractAddress,
        })),
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
            label="Merchant Name (English)"
            required
            value={merchantNameEn}
            onChange={(e) => setMerchantNameEn(e.target.value)}
            placeholder="Enter merchant name in English"
          />

          <InputField
            label="Merchant Name (Thai)"
            required
            value={merchantNameTh}
            onChange={(e) => setMerchantNameTh(e.target.value)}
            placeholder="Enter merchant name in Thai"
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <PinInputField
                  label="PIN"
                  boxSize="2.5rem"
                  value={staff.pin}
                  onChange={(v) => updateStaff(sIdx, 'pin', v)}
                />
                <PinInputField
                  label="Confirm PIN"
                  boxSize="2.5rem"
                  value={staff.confirmPin}
                  onChange={(v) => updateStaff(sIdx, 'confirmPin', v)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField
                  label="Store Name (English)"
                  required
                  value={store.nameEn}
                  onChange={(e) => updateStore(sIdx, 'nameEn', e.target.value)}
                  placeholder="Store name in English"
                />
                <InputField
                  label="Store Name (Thai)"
                  required
                  value={store.nameTh}
                  onChange={(e) => updateStore(sIdx, 'nameTh', e.target.value)}
                  placeholder="Store name in Thai"
                />
              </div>

              <AddressFields
                title="Registered Address"
                value={store.registeredAddress}
                onChange={(value) => updateStore(sIdx, 'registeredAddress', value)}
                provinceOptions={provinceOptions}
                language={language}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                <input
                  type="checkbox"
                  checked={store.contractSameAsRegistered}
                  onChange={(e) => updateStore(sIdx, 'contractSameAsRegistered', e.target.checked)}
                />
                Contract address is the same as the registered address
              </label>

              {!store.contractSameAsRegistered && (
                <AddressFields
                  title="Contract Address"
                  value={store.contractAddress}
                  onChange={(value) => updateStore(sIdx, 'contractAddress', value)}
                  provinceOptions={provinceOptions}
                  language={language}
                />
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-sub)' }}>Terminals</span>
                  <Button type="button" variant="secondary" style={{ width: 'auto' }} onClick={() => addTerminal(sIdx)}>+ Add Terminal</Button>
                </div>
                {store.terminals.map((terminal, tIdx) => (
                  <TerminalRow key={tIdx}>
                    <TerminalInput
                      required
                      value={terminal.nameEn}
                      onChange={(e) => updateTerminal(sIdx, tIdx, 'nameEn', e.target.value)}
                      placeholder="Terminal Name (English)"
                    />
                    <TerminalInput
                      required
                      value={terminal.nameTh}
                      onChange={(e) => updateTerminal(sIdx, tIdx, 'nameTh', e.target.value)}
                      placeholder="Terminal Name (Thai)"
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
