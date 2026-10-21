'use client';

import React from 'react';
import { Badge, type BadgeVariant } from '@apisit110/pos-ui';
import { useTranslation } from '../i18n/LanguageContext';

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  approved: 'success',
  success: 'success',
  failed: 'error',
  pending: 'warning',
  voided: 'warning',
  refunded: 'info',
};

export function TransactionStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const key = status?.toLowerCase();
  const variant = STATUS_VARIANTS[key] ?? 'neutral';
  const label = t.transactionStatus[key as keyof typeof t.transactionStatus] ?? status;
  return (
    <Badge $variant={variant} $shape="pill">
      {label || '-'}
    </Badge>
  );
}
