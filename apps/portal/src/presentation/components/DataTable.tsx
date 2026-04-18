'use client';

import React from 'react';
import styled from 'styled-components';

const TableWrapper = styled.div`
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border);
  overflow: hidden;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const THead = styled.thead`
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border);
`;

const Th = styled.th`
  padding: 1rem;
  color: var(--text-sub);
  font-weight: 600;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
`;

const Tr = styled.tr`
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  &:last-child {
    border-bottom: none;
  }
`;

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  footer?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({ columns, data, footer }: DataTableProps<T>) {
  return (
    <TableWrapper>
      <StyledTable>
        <THead>
          <tr>
            {columns.map((col, idx) => (
              <Th key={idx} style={{ width: col.width }}>{col.header}</Th>
            ))}
          </tr>
        </THead>
        <tbody>
          {data.map((item) => (
            <Tr key={item.id}>
              {columns.map((col, idx) => (
                <Td key={idx}>
                  {typeof col.accessor === 'function' 
                    ? col.accessor(item) 
                    : (item[col.accessor] as React.ReactNode)}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </StyledTable>
      {footer}
    </TableWrapper>
  );
}
