'use client';

import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  height: 70px;
  background: var(--bg-main);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const Avatar = styled.div`
  width: 35px;
  height: 35px;
  background: var(--border);
  border-radius: 50%;
`;

interface TopBarProps {
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  return (
    <Header>
      <Title>{title}</Title>
      <Actions>
        <Avatar />
      </Actions>
    </Header>
  );
};
