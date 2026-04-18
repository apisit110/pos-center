'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 260px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
`;

const Logo = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: var(--primary);
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MenuItem = styled.div<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-sub)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    color: ${props => props.$active ? 'var(--primary)' : 'var(--text-main)'};
  }
`;

const UserProfile = styled.div`
  margin-top: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
`;

const UserName = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: var(--text-sub);
`;

interface SidebarProps {
  menuItems: { name: string; path: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const pathname = usePathname();

  return (
    <SidebarContainer>
      <Logo>Lightning POS</Logo>
      <Nav>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
            <MenuItem $active={pathname === item.path}>
              {item.name}
            </MenuItem>
          </Link>
        ))}
      </Nav>
      <UserProfile>
        <UserName>Admin User</UserName>
        <UserEmail>admin@example.com</UserEmail>
      </UserProfile>
    </SidebarContainer>
  );
};
