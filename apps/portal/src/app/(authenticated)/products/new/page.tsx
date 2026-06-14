'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useRouter } from 'next/navigation';
import { CreateProductUseCase } from '../../../../domain/usecases/CreateProductUseCase';
import { BatchCreateProductsUseCase } from '../../../../domain/usecases/BatchCreateProductsUseCase';
import { GetMerchantsUseCase } from '../../../../domain/usecases/GetMerchantsUseCase';
import { ApiProductRepository } from '../../../../infrastructure/repositories/ApiProductRepository';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { InputField, SelectFilter, Button } from '@apisit110/pos-ui';

/* ─── Animations ───────────────────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const checkmark = keyframes`
  0% { stroke-dashoffset: 50; }
  100% { stroke-dashoffset: 0; }
`;

/* ─── Layout ───────────────────────────────────────────────── */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
`;

/* ─── Mode Selector ────────────────────────────────────────── */

const ModeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
`;

const ModeCard = styled.button<{ $active?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.10))'
    : 'var(--bg-card)'};
  border: 2px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
  }

  ${props => props.$active && css`
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 8px 25px rgba(99, 102, 241, 0.15);
  `}
`;

const ModeIcon = styled.div<{ $active?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--primary), #8b5cf6)'
    : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.25s ease;
`;

const ModeTitle = styled.span`
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-main);
`;

const ModeDescription = styled.span`
  font-size: 0.85rem;
  color: var(--text-sub);
  text-align: center;
  line-height: 1.4;
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
    stroke: white;
    stroke-width: 3;
    fill: none;
    stroke-dasharray: 50;
    animation: ${checkmark} 0.3s ease forwards;
  }
`;

/* ─── Forms ────────────────────────────────────────────────── */

const FormCard = styled.div`
  background: var(--bg-card);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.3s ease;
`;


const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;


/* ─── JSON Upload Zone ─────────────────────────────────────── */

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

/* ─── Preview Table ────────────────────────────────────────── */

const PreviewContainer = styled.div`
  margin-top: 1.5rem;
  animation: ${fadeIn} 0.3s ease;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary);
`;

const PreviewBadge = styled.span`
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  max-height: 400px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--border);
  }

  th {
    background: rgba(15, 23, 42, 0.8);
    color: var(--text-sub);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
`;

/* ─── Result Toast ─────────────────────────────────────────── */

const ResultBanner = styled.div<{ $type: 'success' | 'error' }>`
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-top: 1rem;
  background: ${props => props.$type === 'success'
    ? 'rgba(34, 197, 94, 0.12)'
    : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid ${props => props.$type === 'success'
    ? 'rgba(34, 197, 94, 0.3)'
    : 'rgba(239, 68, 68, 0.3)'};
  color: ${props => props.$type === 'success' ? '#22c55e' : '#ef4444'};
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;
`;


/* ─── JSON product type (from master_product.json) ─────────── */

interface MasterProduct {
  uid: string;
  image_url: string[];
  name_en: string | null;
  name_th: string;
  brand_en: string | null;
  brand_th: string;
  company_name_en: string | null;
  company_name_th: string | null;
  base_price: number;
  unit_name: string;
  barcode: string;
  qrcode: string | null;
  merchant_id: number;
}

/* ═══════════════════════════════════════════════════════════ */

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode state
  const [mode, setMode] = useState<'keyin' | 'json'>('keyin');

  const [merchants, setMerchants] = useState<{ value: string; label: string }[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');

  // Key-in form state
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [brand, setBrand] = useState('');
  const [unitName, setUnitName] = useState('');

  // JSON import state
  const [jsonProducts, setJsonProducts] = useState<MasterProduct[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Shared
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      const merchantRepo = new ApiMerchantRepository();
      const useCase = new GetMerchantsUseCase(merchantRepo);
      const data = await useCase.execute();
      setMerchants(data.map(m => ({ value: m.uid, label: m.name })));
    })();
  }, []);

  /* ─── Key-in Submit ──────────────────────────────────────── */

  const handleKeyinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) {
      setResult({ type: 'error', message: 'Please select a merchant' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const repo = new ApiProductRepository();
      const useCase = new CreateProductUseCase(repo);
      await useCase.execute({
        merchantId: selectedMerchant,
        name,
        barcode,
        basePrice: Number(basePrice),
        imageUrl: [],
        brand,
        unitName
      });
      setResult({ type: 'success', message: 'Product created successfully!' });
      // Reset form
      setName('');
      setBarcode('');
      setBasePrice('');
      setBrand('');
      setUnitName('');
    } catch (err: any) {
      setResult({ type: 'error', message: err?.response?.data?.message || err.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  /* ─── JSON file handling ─────────────────────────────────── */

  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const items: MasterProduct[] = Array.isArray(parsed) ? parsed : [parsed];
        setJsonProducts(items);
        setResult(null);
      } catch {
        setResult({ type: 'error', message: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      processJsonFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processJsonFile(file);
  };

  const handleLoadMaster = async () => {
    try {
      const res = await fetch('/constants/master_product.json');
      const data = await res.json();
      setJsonProducts(data);
      setResult(null);
    } catch {
      setResult({ type: 'error', message: 'Failed to load master product list' });
    }
  };

  /* ─── JSON batch submit ──────────────────────────────────── */

  const handleJsonSubmit = async () => {
    if (!selectedMerchant) {
      setResult({ type: 'error', message: 'Please select a merchant' });
      return;
    }
    if (!jsonProducts.length) {
      setResult({ type: 'error', message: 'No products to import' });
      return;
    }

    setLoading(true);
    setProgress(null);
    setResult(null);

    try {
      const repo = new ApiProductRepository();
      const useCase = new BatchCreateProductsUseCase(repo);
      const requests = jsonProducts.map(p => ({
        uid: p.uid,
        merchantId: selectedMerchant,
        name: p.name_th || p.name_en || '',
        barcode: p.barcode || '',
        basePrice: p.base_price,
        imageUrl: p.image_url || [],
        brand: p.brand_th || p.brand_en || '',
        unitName: p.unit_name || ''
      }));

      const res = await useCase.execute(requests, (done, total) => setProgress({ done, total }));
      const msg = `Successfully created ${res.created} product(s).` +
        (res.errors.length > 0 ? ` ${res.errors.length} error(s).` : '');
      setResult({ type: res.errors.length === 0 ? 'success' : 'error', message: msg });

      if (res.created > 0) {
        setJsonProducts([]);
      }
    } catch (err: any) {
      setResult({ type: 'error', message: err?.response?.data?.message || err.message || 'Failed to import products' });
    } finally {
      setLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════ */

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Title>Add Product</Title>
        <Button variant="secondary" style={{ width: 'auto' }} onClick={() => router.push('/products')}>
          ← Back to Products
        </Button>
      </Header>

      {/* Mode Selector */}
      <ModeSelector>
        <ModeCard $active={mode === 'keyin'} onClick={() => setMode('keyin')}>
          {mode === 'keyin' && (
            <ActiveBadge>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            </ActiveBadge>
          )}
          <ModeIcon $active={mode === 'keyin'}>⌨️</ModeIcon>
          <ModeTitle>Key-in</ModeTitle>
          <ModeDescription>Manually enter product details one by one</ModeDescription>
        </ModeCard>

        <ModeCard $active={mode === 'json'} onClick={() => setMode('json')}>
          {mode === 'json' && (
            <ActiveBadge>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            </ActiveBadge>
          )}
          <ModeIcon $active={mode === 'json'}>📦</ModeIcon>
          <ModeTitle>Import from JSON</ModeTitle>
          <ModeDescription>Bulk import products from a JSON file or master list</ModeDescription>
        </ModeCard>
      </ModeSelector>

      {/* Merchant Selector (shared) */}
      <FormCard>
        <SelectFilter
          label="Merchant *"
          value={selectedMerchant}
          onChange={setSelectedMerchant}
          options={merchants}
          placeholder="Select a merchant..."
        />
      </FormCard>

      {/* ─── Mode: Key-in ────────────────────────────────── */}
      {mode === 'keyin' && (
        <FormCard>
          <form onSubmit={handleKeyinSubmit}>
            <InputField
              label="Product Name *"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. เป๊ปซี่ 345มล"
            />

            <TwoCol>
              <InputField
                label="Barcode"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="e.g. 8858998581221"
              />
              <InputField
                label="Base Price *"
                required
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                placeholder="0.00"
              />
            </TwoCol>

            <TwoCol>
              <InputField
                label="Brand"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. เป๊ปซี่"
              />
              <InputField
                label="Unit"
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                placeholder="e.g. ขวด, กระป๋อง"
              />
            </TwoCol>

            <Button type="submit" isLoading={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </form>

          {result && (
            <ResultBanner $type={result.type}>{result.message}</ResultBanner>
          )}
        </FormCard>
      )}

      {/* ─── Mode: JSON Import ───────────────────────────── */}
      {mode === 'json' && (
        <FormCard>
          {jsonProducts.length === 0 ? (
            <>
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
                <DropHint>Accepts .json files matching the master_product structure</DropHint>
              </DropZone>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                hidden
                onChange={handleFileSelect}
              />

              <div style={{ textAlign: 'center', margin: '1.5rem 0 0' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>or</span>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Button type="button" style={{ width: 'auto' }} onClick={handleLoadMaster}>
                  📋 Load Master Product List
                </Button>
              </div>
            </>
          ) : (
            <PreviewContainer>
              <PreviewHeader>
                <PreviewTitle>Preview Products</PreviewTitle>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <PreviewBadge>{jsonProducts.length} items</PreviewBadge>
                  <Button variant="danger" style={{ width: 'auto' }} onClick={() => setJsonProducts([])}>
                    Clear
                  </Button>
                </div>
              </PreviewHeader>

              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Barcode</th>
                      <th>Price</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jsonProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-sub)' }}>{idx + 1}</td>
                        <td>{p.name_th || p.name_en || '—'}</td>
                        <td>{p.brand_th || p.brand_en || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{p.barcode || '—'}</td>
                        <td>{p.base_price?.toLocaleString()} ฿</td>
                        <td>{p.unit_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>

              <Button
                type="button"
                isLoading={loading}
                disabled={loading || !selectedMerchant}
                style={{ marginTop: '1rem' }}
                onClick={handleJsonSubmit}
              >
                {loading
                  ? progress
                    ? `Importing... ${progress.done} / ${progress.total}`
                    : 'Preparing...'
                  : `Import ${jsonProducts.length} Product(s)`}
              </Button>
            </PreviewContainer>
          )}

          {result && (
            <ResultBanner $type={result.type}>{result.message}</ResultBanner>
          )}
        </FormCard>
      )}
    </PageContainer>
  );
}
