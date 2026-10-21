'use client';

import React from 'react';
import { useTranslation } from '../../../presentation/i18n/LanguageContext';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Body leave it empty as requested, just a placeholder for visual confirmation */}
      <div style={{ 
        height: '200px', 
        border: '2px dashed var(--border)', 
        borderRadius: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-sub)'
      }}>
        {t.dashboard.placeholder}
      </div>
    </div>
  );
}
