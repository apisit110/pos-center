'use client';

import React from 'react';
import { Badge, type BadgeVariant } from '@apisit110/pos-ui';

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  approved: 'success',
  success: 'success',
  failed: 'error',
  pending: 'warning',
  voided: 'warning',
  refunded: 'info',
};

export function TransactionStatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANTS[status?.toLowerCase()] ?? 'neutral';
  return (
    <Badge $variant={variant} $shape="pill">
      {status || '-'}
    </Badge>
  );
}
