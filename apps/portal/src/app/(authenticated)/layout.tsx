'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null; // Or a loading spinner

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Merchants', path: '/merchants' },
    { name: 'Stores', path: '/stores' },
    { name: 'Products', path: '/products' },
    { name: 'Map Store Products', path: '/map-store' },
    { name: 'Members', path: '/members' },
    { name: 'Staff', path: '/staff' },
    { name: 'Transactions', path: '/transactions' },
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
