'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar as SharedSidebar } from '@apisit110/pos-ui';
import { useAppTheme } from '../../lib/theme-context';

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

interface SidebarProps {
  menuItems: { name: string; path: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { themeMode, toggleTheme } = useAppTheme();

  const navItems = menuItems.map(item => ({
    label: item.name,
    active: item.path === '/dashboard'
      ? pathname === item.path
      : pathname.startsWith(item.path),
    onClick: () => router.push(item.path),
  }));

  return (
    <SharedSidebar
      logoTitle="POS Center"
      logoIcon={<LogoIcon />}
      navItems={navItems}
      themeMode={themeMode}
      onThemeToggle={toggleTheme}
    />
  );
};
