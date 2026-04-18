'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GetProductsUseCase } from '../../../application/use-cases/GetProductsUseCase';
import { MockProductRepository } from '../../../infrastructure/repositories/MockProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DataTable } from '../../../presentation/components/DataTable';
import { Pagination } from '../../../presentation/components/Pagination';
import { useRouter } from 'next/navigation';

const CategoryBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-size: 0.85rem;
`;

const StockText = styled.span<{ $low: boolean }>`
  color: ${props => props.$low ? '#f87171' : 'var(--text-main)'};
`;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      const repository = new MockProductRepository();
      const useCase = new GetProductsUseCase(repository);
      const result = await useCase.execute(page, limit);
      setProducts(result.products);
      setTotal(result.total);
    };

    fetchProducts();
  }, [page, limit]);

  const columns = [
    { header: 'Barcode', accessor: 'barcode' as const, width: '150px' },
    { header: 'Name', accessor: (p: Product) => p.name },
    { header: 'Brand', accessor: (p: Product) => p.brand },
    { 
      header: 'Price', 
      accessor: (p: Product) => `${p.basePrice.toLocaleString()} ฿` 
    },
    { header: 'Unit', accessor: 'unitName' as const },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={products} 
      onRowClick={(product) => router.push(`/dashboard/products/${product.id}`)}
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
  );
}
