'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BatchCreateProductsUseCase } from '../../../../domain/usecases/BatchCreateProductsUseCase';
import { GetMerchantsUseCase } from '../../../../domain/usecases/GetMerchantsUseCase';
import { GetStoresUseCase } from '../../../../domain/usecases/GetStoresUseCase';
import { BatchUpsertStoreProductsUseCase } from '../../../../domain/usecases/BatchUpsertStoreProductsUseCase';
import { ApiProductRepository } from '../../../../infrastructure/repositories/ApiProductRepository';
import { ApiMerchantRepository } from '../../../../infrastructure/repositories/ApiMerchantRepository';
import { ApiStoreRepository } from '../../../../infrastructure/repositories/ApiStoreRepository';
import { ApiStoreProductRepository } from '../../../../infrastructure/repositories/ApiStoreProductRepository';
import { ApiBrandRepository } from '../../../../infrastructure/repositories/ApiBrandRepository';
import { BatchUpsertBrandsUseCase } from '../../../../domain/usecases/BatchUpsertBrandsUseCase';
import { formatAmount } from '../../../../lib/formatAmount';
import { useTranslation } from '../../../../presentation/i18n/LanguageContext';
import {
  MasterBrand,
  MasterProduct,
  MasterStoreProduct,
  parseMasterProductXlsx
} from '../../../../infrastructure/parsers/MasterProductXlsxParser';
import { SelectFilter, Button, FileDropZone } from '@apisit110/pos-ui';

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

/* ─── Layout ───────────────────────────────────────────────── */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease;
`;

const SampleLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
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

/* ─── Forms ────────────────────────────────────────────────── */

const FormCard = styled.div`
  background: var(--bg-card);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.3s ease;
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

  th,
  td {
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
  background: ${(props) =>
    props.$type === 'success'
      ? 'rgba(34, 197, 94, 0.12)'
      : 'rgba(239, 68, 68, 0.12)'};
  border: 1px solid
    ${(props) =>
      props.$type === 'success'
        ? 'rgba(34, 197, 94, 0.3)'
        : 'rgba(239, 68, 68, 0.3)'};
  color: ${(props) => (props.$type === 'success' ? '#22c55e' : '#ef4444')};
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;
`;

const ErrorList = styled.ul`
  margin: 0.75rem 0 0 0;
  padding: 0.75rem 1rem 0.75rem 2rem;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg-card);
  color: var(--text-sub);
  font-size: 0.85rem;
`;

/* ═══════════════════════════════════════════════════════════ */

export default function AddProductPage() {
  const { language } = useTranslation();

  const [merchants, setMerchants] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');

  // Excel import state
  const [importProducts, setImportProducts] = useState<MasterProduct[]>([]);
  const [importBrands, setImportBrands] = useState<MasterBrand[]>([]);
  const [importStoreProducts, setImportStoreProducts] = useState<
    MasterStoreProduct[]
  >([]);
  const [stores, setStores] = useState<{ value: string; label: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState('');

  // Shared
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const merchantRepo = new ApiMerchantRepository();
      const useCase = new GetMerchantsUseCase(merchantRepo);
      const data = await useCase.execute(1, 100);
      setMerchants(
        data.merchants.map((m) => ({ value: m.uid, label: m.displayName(language) }))
      );
    })();
  }, []);

  // stores are only needed to map the store_product sheet
  useEffect(() => {
    if (!selectedMerchant || importStoreProducts.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await new GetStoresUseCase(
          new ApiStoreRepository()
        ).execute(selectedMerchant);
        if (!cancelled)
          setStores(data.map((st) => ({ value: st.uid, label: st.displayName(language) })));
      } catch {
        if (!cancelled)
          setResult({ type: 'error', message: 'Failed to load stores' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedMerchant, importStoreProducts.length]);

  const handleMerchantChange = (uid: string) => {
    setSelectedMerchant(uid);
    setSelectedStore('');
    setStores([]);
  };

  /* ─── File handling ─────────────────────────────────── */

  const loadParsedFile = async (buffer: ArrayBuffer) => {
    try {
      const parsed = await parseMasterProductXlsx(buffer);
      if (parsed.products.length === 0) {
        setResult({
          type: 'error',
          message: 'No products found in sheet "product"'
        });
        return;
      }
      setImportProducts(parsed.products);
      setImportStoreProducts(parsed.storeProducts);
      setImportBrands(parsed.brands);
      setImportErrors([]);
      setResult(null);
    } catch (err) {
      const message =
        err instanceof Error &&
        err.message.startsWith('Invalid master product file')
          ? err.message
          : 'Invalid Excel file';
      setResult({ type: 'error', message });
    }
  };

  const processFile = async (file: File) =>
    loadParsedFile(await file.arrayBuffer());

  const clearImport = () => {
    setImportProducts([]);
    setImportStoreProducts([]);
    setImportBrands([]);
  };

  const brandNameByUid = new Map(importBrands.map((b) => [b.uid, language === 'en' ? b.name_en : b.name_th]));

  /* ─── Import submit ──────────────────────────────────── */

  const handleImportSubmit = async () => {
    if (!selectedMerchant) {
      setResult({ type: 'error', message: 'Please select a merchant' });
      return;
    }
    if (!importProducts.length) {
      setResult({ type: 'error', message: 'No products to import' });
      return;
    }
    if (importStoreProducts.length > 0 && !selectedStore) {
      setResult({ type: 'error', message: 'Please select a store' });
      return;
    }

    setLoading(true);
    setProgress(null);
    setResult(null);
    setImportErrors([]);

    try {
      // brands first, so the products can reference them by brand_uid
      let brandMessage = '';
      if (importBrands.length > 0) {
        const brandResult = await new BatchUpsertBrandsUseCase(new ApiBrandRepository()).execute(
          importBrands.map((b) => ({ uid: b.uid, nameEn: b.name_en, nameTh: b.name_th }))
        );
        brandMessage = ` Brands: ${brandResult.created} added, ${brandResult.updated} updated.`;
      }

      const repo = new ApiProductRepository();
      const useCase = new BatchCreateProductsUseCase(repo);
      const requests = importProducts.map((p) => ({
        uid: p.uid,
        merchantId: selectedMerchant,
        nameEn: p.name_en || p.name_th || '',
        nameTh: p.name_th || p.name_en || '',
        barcode: p.barcode || '',
        basePrice: p.base_price,
        // the API keeps one image url per product
        imageUrl: p.image_url[0] || '',
        // a uid of sheet `brand`; a uid that is not a brand is reported by the API as `Brand not found`
        brandUid: p.brand_uid || '',
        unitName: p.unit_name || ''
      }));

      const res = await useCase.execute(requests, (done, total) =>
        setProgress({ done, total })
      );
      const errors = [...res.errors];
      let message = `Successfully created ${res.created} product(s).${brandMessage}`;

      // map price/stock for the products in the file (rows of products that failed above are reported by the API)
      if (importStoreProducts.length > 0 && res.created > 0) {
        const productUids = new Set(importProducts.map((p) => p.uid));
        const mappings = [];
        for (const sp of importStoreProducts) {
          if (productUids.has(sp.product_uid)) {
            mappings.push({
              store_uid: selectedStore,
              product_uid: sp.product_uid,
              stock: sp.stock,
              price: sp.price
            });
          } else {
            errors.push(
              `Store product ${sp.product_uid}: product not found in sheet "product"`
            );
          }
        }
        setProgress(null);
        const mapped = await new BatchUpsertStoreProductsUseCase(
          new ApiStoreProductRepository()
        ).execute(mappings);
        message += ` Store products: ${mapped.created} added, ${mapped.updated} updated.`;
        errors.push(...mapped.errors.map((m) => `Store product ${m}`));
      }

      setResult({
        type: errors.length === 0 ? 'success' : 'error',
        message:
          message + (errors.length > 0 ? ` ${errors.length} error(s).` : '')
      });
      setImportErrors(errors);

      if (res.created > 0) {
        clearImport();
      }
    } catch (err: any) {
      setResult({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err.message ||
          'Failed to import products'
      });
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
      </Header>

      {/* Merchant Selector (shared) */}
      <FormCard>
        <SelectFilter
          label="Merchant *"
          value={selectedMerchant}
          onChange={handleMerchantChange}
          options={merchants}
          placeholder="Select a merchant..."
        />
      </FormCard>

      <FormCard>
        {importProducts.length === 0 ? (
          <>
            <FileDropZone
              accept=".xlsx"
              icon="📄"
              onFile={processFile}
              hint={
                <>
                  Sheet &quot;product&quot; (required), sheet
                  &quot;store_product&quot; (optional: stock/price) and sheet
                  &quot;brand&quot; (optional)
                </>
              }
            >
              Drag & drop an Excel (.xlsx) file here, or{' '}
              <strong>browse</strong>
            </FileDropZone>
            <SampleLinks>
              <a href="/constants/master_product_v2_prouct_with_store_product.xlsx" download>
                <Button variant="secondary" style={{ width: 'auto' }}>
                  ⬇ Download sample (with store product)
                </Button>
              </a>
              <a href="/constants/master_product_v3_no_store_product.xlsx" download>
                <Button variant="secondary" style={{ width: 'auto' }}>
                  ⬇ Download sample (product only)
                </Button>
              </a>
            </SampleLinks>
          </>
        ) : (
          <PreviewContainer>
            <PreviewHeader>
              <PreviewTitle>Preview Products</PreviewTitle>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
              >
                <PreviewBadge>{importProducts.length} items</PreviewBadge>
                {importBrands.length > 0 && (
                  <PreviewBadge>{importBrands.length} brand(s)</PreviewBadge>
                )}
                {importStoreProducts.length > 0 && (
                  <PreviewBadge>
                    {importStoreProducts.length} store product(s)
                  </PreviewBadge>
                )}
                <Button
                  variant="danger"
                  style={{ width: 'auto' }}
                  onClick={clearImport}
                >
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
                  {importProducts.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-sub)' }}>{idx + 1}</td>
                      <td>{p.name_th || p.name_en || '—'}</td>
                      <td>{(p.brand_uid && brandNameByUid.get(p.brand_uid)) || p.brand_th || p.brand_en || '—'}</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {p.barcode || '—'}
                      </td>
                      <td>{formatAmount(p.base_price ?? 0)} ฿</td>
                      <td>{p.unit_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            {importStoreProducts.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <SelectFilter
                  label="Store * (price & stock will be mapped to this store)"
                  value={selectedStore}
                  onChange={setSelectedStore}
                  options={stores}
                  placeholder={
                    selectedMerchant
                      ? 'Select a store...'
                      : 'Select a merchant first'
                  }
                />
              </div>
            )}

            <Button
              type="button"
              isLoading={loading}
              disabled={
                loading ||
                !selectedMerchant ||
                (importStoreProducts.length > 0 && !selectedStore)
              }
              style={{ marginTop: '1rem' }}
              onClick={handleImportSubmit}
            >
              {loading
                ? progress
                  ? `Importing... ${progress.done} / ${progress.total}`
                  : 'Preparing...'
                : `Import ${importProducts.length} Product(s)`}
            </Button>
          </PreviewContainer>
        )}

        {result && (
          <ResultBanner $type={result.type}>{result.message}</ResultBanner>
        )}

        {importErrors.length > 0 && (
          <ErrorList>
            {importErrors.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ErrorList>
        )}
      </FormCard>
    </PageContainer>
  );
}
