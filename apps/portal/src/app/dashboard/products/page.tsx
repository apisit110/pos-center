'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GetProductsUseCase } from '../../../application/use-cases/GetProductsUseCase';
import { MockProductRepository } from '../../../infrastructure/repositories/MockProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DataTable } from '../../../presentation/components/DataTable';
import { Pagination } from '../../../presentation/components/Pagination';

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
    { header: 'ID', accessor: 'id' as const, width: '80px' },
    { header: 'Name', accessor: 'name' as const },
    { 
      header: 'Category', 
      accessor: (p: Product) => <CategoryBadge>{p.category}</CategoryBadge> 
    },
    { 
      header: 'Price', 
      accessor: (p: Product) => `$${p.price.toLocaleString()}` 
    },
    { 
      header: 'Stock', 
      accessor: (p: Product) => (
        <StockText $low={p.stock < 20}>{p.stock}</StockText>
      )
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={products} 
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
