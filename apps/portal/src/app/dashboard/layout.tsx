'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../../presentation/components/Sidebar';
import { TopBar } from '../../presentation/components/TopBar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentBody = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/dashboard/products' },
    { name: 'Members', path: '/dashboard/members' },
    { name: 'Orders', path: '/dashboard/orders' },
    { name: 'Inventory', path: '/dashboard/inventory' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  const currentTitle = menuItems.find(i => pathname.startsWith(i.path) && (i.path !== '/dashboard' || pathname === '/dashboard'))?.name || 'Dashboard';

  return (
    <LayoutContainer>
      <Sidebar menuItems={menuItems} />
      <MainArea>
        <TopBar title={currentTitle} />
        <ContentBody>
          {children}
        </ContentBody>
      </MainArea>
    </LayoutContainer>
  );
}
