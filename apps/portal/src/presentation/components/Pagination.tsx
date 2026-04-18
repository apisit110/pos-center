'use client';

import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2rem;
  border-top: 1px solid var(--border);
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-sub);
`;

const Select = styled.select`
  background: transparent;
  color: white;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 0.9rem;

  option {
    background: var(--bg-card);
  }
`;

const RangeDisplay = styled.div`
  color: var(--text-main);
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageNumber = styled.button<{ $active: boolean }>`
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$active ? 'var(--primary)' : 'transparent'};
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  total, 
  page, 
  limit, 
  onPageChange, 
  onLimitChange 
}) => {
  const totalPages = Math.ceil(total / limit);
  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  const getPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p >= page - 1 && p <= page + 1 || (page <= 2 && p <= 3) || (page >= totalPages - 1 && p >= totalPages - 2));
  };

  return (
    <PaginationContainer>
      <InfoSection>
        <RowsPerPage>
          <span>Rows per page:</span>
          <Select 
            value={limit} 
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {[10, 20, 30, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Select>
        </RowsPerPage>

        <RangeDisplay>
          {startRange}-{endRange} of {total}
        </RangeDisplay>
      </InfoSection>

      <ButtonGroup>
        <IconButton onClick={() => onPageChange(1)} disabled={page === 1}>{"<<"}</IconButton>
        <IconButton onClick={() => onPageChange(page - 1)} disabled={page === 1}>{"<"}</IconButton>
        
        <div style={{ display: 'flex', gap: '0.25rem', margin: '0 0.5rem' }}>
          {getPageNumbers().map(pageNum => (
            <PageNumber 
              key={pageNum} 
              $active={page === pageNum}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </PageNumber>
          ))}
        </div>

        <IconButton onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>{">"}</IconButton>
        <IconButton onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>{">>"}</IconButton>
      </ButtonGroup>
    </PaginationContainer>
  );
};
