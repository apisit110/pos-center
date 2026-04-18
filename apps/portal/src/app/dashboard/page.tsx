import React from 'react';

export default function DashboardPage() {
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
        Content will be placed here
      </div>
    </div>
  );
}
