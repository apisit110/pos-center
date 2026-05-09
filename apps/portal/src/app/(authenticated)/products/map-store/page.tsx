'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../../infrastructure/repositories/ApiStoreRepository';
import { ApiStoreProductRepository } from '../../../../infrastructure/repositories/ApiStoreProductRepository';
import { GetMerchantsUseCase } from '../../../../application/use-cases/GetMerchantsUseCase';
import { GetStoresUseCase } from '../../../../application/use-cases/GetStoresUseCase';
import { BatchUpsertStoreProductsUseCase } from '../../../../application/use-cases/BatchUpsertStoreProductsUseCase';
import { Merchant } from '../../../../domain/entities/Merchant';
import { Store } from '../../../../domain/entities/Store';

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
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: ${props => props.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: ${props => props.$active ? 'none' : '1px solid var(--border)'};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-sub);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  color: white;
  font-size: 1rem;
  &:focus {
    outline: 2px solid var(--primary);
    border-color: transparent;
  }
`;

const ActionButton = styled.button<{ $variant?: 'secondary' | 'primary' }>`
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.05)' : 'var(--primary)'};
  color: white;
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--border)' : 'none'};
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary-hover)'};
  }
`;

const DropZone = styled.div<{ $dragActive?: boolean }>`
  border: 2px dashed ${props => props.$dragActive ? 'var(--primary)' : 'var(--border)'};
  border-radius: 1.25rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: ${props => props.$dragActive
    ? 'rgba(99, 102, 241, 0.08)'
    : 'rgba(255, 255, 255, 0.015)'};

  &:hover {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }
`;

const DropIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const DropText = styled.p`
  color: var(--text-sub);
  margin: 0;
  font-size: 0.95rem;

  strong {
    color: var(--primary);
    cursor: pointer;
  }
`;

const DropHint = styled.p`
  color: var(--text-sub);
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  opacity: 0.7;
`;

const HiddenInput = styled.input`
  display: none;
`;

const JsonPreview = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  color: #a5b4fc;
  font-size: 0.85rem;
  overflow-x: auto;
  max-height: 200px;
  margin-top: 1rem;
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SuccessText = styled.p`
  color: #10b981;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(15, 23, 42, 0.5)',
    borderColor: 'var(--border)',
    color: 'white',
    padding: '0.2rem',
    borderRadius: '0.5rem',
  }),
  menu: (base: any) => ({
    ...base,
    background: '#1e293b',
    border: '1px solid var(--border)',
    zIndex: 100,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'white',
  }),
  input: (base: any) => ({
    ...base,
    color: 'white',
  })
};

export default function MapProductStorePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [dragActive, setDragActive] = useState(false);

  // Data State
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<{value: string, label: string} | null>(null);
  const [selectedStore, setSelectedStore] = useState<{value: string, label: string} | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const repo = new ApiMerchantRepository();
        const useCase = new GetMerchantsUseCase(repo);
        const data = await useCase.execute();
        setMerchants(data);
      } catch (err) {
        console.error('Failed to fetch merchants', err);
      }
    };
    fetchMerchants();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      if (!selectedMerchant) {
        setStores([]);
        return;
      }
      try {
        const repo = new ApiStoreRepository();
        const useCase = new GetStoresUseCase(repo);
        const data = await useCase.execute(selectedMerchant.value);
        setStores(data);
      } catch (err) {
        console.error('Failed to fetch stores', err);
      }
    };
    fetchStores();
  }, [selectedMerchant]);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    storeId: '',
    productId: '',
    stock: '',
    price: '',
  });

  // Import State
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting manual mapping:', manualForm);
    alert('Mapping saved successfully! (Mock)');
    setManualForm({ storeId: '', productId: '', stock: '', price: '' });
  };

  const processJsonFile = (file: File) => {
    setImportError('');
    setImportSuccess('');
    setImportedData(null);

    if (!selectedStore) {
      setImportError('Please select a merchant and store before importing.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error('Import file must contain a JSON array of mappings.');
        }
        
        // Basic validation against the master_store_product.json structure
        const isValid = json.every(item => item.product_uid && typeof item.stock === 'number' && typeof item.price === 'number');
        
        if (!isValid) {
          throw new Error('Invalid JSON structure. Ensure product_uid, stock, and price exist.');
        }

        const store = stores.find(s => s.uid === selectedStore.value);
        const mappedData = json.map(item => ({
          ...item,
          store_uid: store?.uid || selectedStore.value,
        }));

        setImportedData(mappedData);
        setImportSuccess(`Successfully parsed ${json.length} mappings for ${store?.name || selectedStore.label}.`);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processJsonFile(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      processJsonFile(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!importedData || importedData.length === 0) {
      return;
    }

    setImportError('');
    setImportSuccess('');
    setIsImporting(true);

    try {
      const mappings = importedData.map((item) => ({
        store_uid: item.store_uid,
        product_uid: item.product_uid,
        stock: Number(item.stock),
        price: Number(item.price),
      }));

      const repository = new ApiStoreProductRepository();
      const useCase = new BatchUpsertStoreProductsUseCase(repository);
      const response = await useCase.execute(mappings);
      const createdCount = response.created ?? 0;
      const updatedCount = response.updated ?? 0;

      setImportSuccess(
        `Successfully processed mappings. Created: ${createdCount}, Updated: ${updatedCount}.`
      );
      setImportedData(null);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        'Failed to import mappings. Please try again.';
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Map Product to Store</Title>
        <ActionButton $variant="secondary" style={{ width: 'auto', marginTop: 0 }} onClick={() => router.back()}>
          Back
        </ActionButton>
      </Header>

      <Section style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <FormGroup>
            <Label>Select Merchant</Label>
            <Select 
              options={merchants.map(m => ({ value: m.uid, label: m.name }))}
              value={selectedMerchant}
              onChange={(val) => {
                setSelectedMerchant(val);
                setSelectedStore(null);
                setManualForm(prev => ({ ...prev, storeId: '' }));
              }}
              placeholder="Select a merchant..."
              styles={selectStyles}
            />
          </FormGroup>
          <FormGroup>
            <Label>Select Store</Label>
            <Select 
              options={stores.map(s => ({ value: s.uid, label: s.name }))}
              value={selectedStore}
              onChange={(val) => {
                setSelectedStore(val);
                if (val) {
                   const store = stores.find(s => s.uid === val?.value);
                   setManualForm(prev => ({ ...prev, storeId: store?.sid || '' }));
                }
              }}
              placeholder="Select a store..."
              isDisabled={!selectedMerchant}
              styles={selectStyles}
            />
          </FormGroup>
        </div>
      </Section>

      <TabContainer>
        <TabButton $active={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>
          Manual Key In
        </TabButton>
        <TabButton $active={activeTab === 'import'} onClick={() => setActiveTab('import')}>
          Import JSON
        </TabButton>
      </TabContainer>

      {activeTab === 'manual' ? (
        <Section>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <FormGroup>
              <Label>Store ID</Label>
              <Input 
                type="text" 
                placeholder="e.g. S-001" 
                required 
                value={manualForm.storeId}
                onChange={(e) => setManualForm({...manualForm, storeId: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <Label>Product ID</Label>
              <Input 
                type="text" 
                placeholder="e.g. P75Lx5mwPw..." 
                required 
                value={manualForm.productId}
                onChange={(e) => setManualForm({...manualForm, productId: e.target.value})}
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <FormGroup>
                <Label>Stock Quantity</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  required 
                  value={manualForm.stock}
                  onChange={(e) => setManualForm({...manualForm, stock: e.target.value})}
                />
              </FormGroup>

              <FormGroup>
                <Label>Unit Price (฿)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  min="0"
                  step="0.01"
                  required 
                  value={manualForm.price}
                  onChange={(e) => setManualForm({...manualForm, price: e.target.value})}
                />
              </FormGroup>
            </div>

            <ActionButton type="submit">Save Mapping</ActionButton>
          </form>
        </Section>
      ) : (
        <Section>
          <FormGroup>
            <Label>Upload Store Products JSON</Label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1rem' }}>
              Upload a JSON file matching the structure of master_store_product.json.
            </p>
            
            <DropZone
              $dragActive={dragActive}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <DropIcon>📄</DropIcon>
              <DropText>
                Drag & drop a JSON file here, or <strong>browse</strong>
              </DropText>
              <DropHint>Accepts .json files matching the master_store_product structure</DropHint>
            </DropZone>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />

            {importError && <ErrorText>{importError}</ErrorText>}
            {importSuccess && <SuccessText>{importSuccess}</SuccessText>}

            {importedData && (
              <>
                <JsonPreview>
                  {JSON.stringify(importedData.slice(0, 3), null, 2)}
                  {importedData.length > 3 && '\n\n  ... (preview limited to first 3 items)'}
                </JsonPreview>
                
                <ActionButton onClick={handleImportSubmit} disabled={isImporting}>
                  {isImporting
                    ? `Importing ${importedData.length} Mapping(s)...`
                    : `Import ${importedData.length} Mappings`}
                </ActionButton>
              </>
            )}
          </FormGroup>
        </Section>
      )}
    </PageContainer>
  );
}
