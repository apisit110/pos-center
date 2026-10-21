'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar as SharedSidebar } from '@apisit110/pos-ui';
import { FiGrid, FiCreditCard, FiShoppingBag, FiPackage, FiUsers } from 'react-icons/fi';
import { useTranslation } from '../i18n/LanguageContext';

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/dashboard': <FiGrid size={18} />,
  '/transactions': <FiCreditCard size={18} />,
  '/merchants': <FiShoppingBag size={18} />,
  '/products': <FiPackage size={18} />,
  '/staff': <FiUsers size={18} />,
};

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

interface SidebarProps {
  menuItems: { name: string; path: string }[];
  user?: { name: string; subtitle?: string };
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems, user, onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const navItems = menuItems.map(item => ({
    label: item.name,
    icon: NAV_ICONS[item.path],
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
      user={user}
      onLogout={onLogout}
      logoutLabel={t.mainLayout.logout}
    />
  );
};
