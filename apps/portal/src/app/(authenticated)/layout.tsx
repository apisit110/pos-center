'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../presentation/components/Sidebar';
import { TopBar } from '../../presentation/components/TopBar';
import { ApiAuthRepository } from '../../infrastructure/repositories/ApiAuthRepository';
import { AuthenticatedStaff } from '../../domain/repositories/AuthRepository';
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
  const [staff, setStaff] = React.useState<AuthenticatedStaff | null>(null);

  React.useEffect(() => {
    let active = true;
    new ApiAuthRepository().getSession().then((session) => {
      if (!active) return;
      if (!session) {
        router.replace('/login');
      } else {
        setStaff(session);
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await new ApiAuthRepository().logout();
    } finally {
      router.replace('/login');
    }
  };

  if (!staff) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Merchants', path: '/merchants' },
    { name: 'Products', path: '/products' },
    { name: 'Staff', path: '/staff' },
  ];

  const currentTitle = menuItems.find(i => pathname.startsWith(i.path) && (i.path !== '/dashboard' || pathname === '/dashboard'))?.name || 'Dashboard';

  return (
    <LayoutContainer>
      <Sidebar menuItems={menuItems} user={{ name: staff.name }} onLogout={handleLogout} />
      <MainArea>
        <TopBar title={currentTitle} />
        <ContentBody>
          {children}
        </ContentBody>
      </MainArea>
    </LayoutContainer>
  );
}
