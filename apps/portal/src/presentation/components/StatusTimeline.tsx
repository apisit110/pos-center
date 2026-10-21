'use client';

import React from 'react';
import styled from 'styled-components';

export interface TimelineStep {
  label: string;
  /** already formatted; omitted when the time was not recorded */
  time?: string;
  /** reached steps are drawn in the primary color, the rest in grey */
  done: boolean;
}

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Step = styled.li`
  display: flex;
  gap: 1rem;
  min-height: 4.5rem;

  &:last-child {
    min-height: 0;
  }
`;

const Rail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Dot = styled.span<{ $done: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${props => (props.$done ? 'var(--primary)' : 'var(--border)')};
`;

const Line = styled.span<{ $done: boolean }>`
  width: 2px;
  flex: 1;
  background: ${props => (props.$done ? 'var(--primary)' : 'var(--border)')};
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 1rem;
`;

const Label = styled.div<{ $done: boolean }>`
  font-weight: 600;
  color: ${props => (props.$done ? 'var(--text-main)' : 'var(--text-sub)')};
`;

const Time = styled.div`
  font-size: 0.875rem;
  color: var(--text-sub);
`;

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <List>
      {steps.map((step, index) => {
        const next = steps[index + 1];
        return (
          <Step key={step.label}>
            <Rail>
              <Dot $done={step.done} />
              {next && <Line $done={step.done && next.done} />}
            </Rail>
            <Text>
              <Label $done={step.done}>{step.label}</Label>
              {step.time && <Time>{step.time}</Time>}
            </Text>
          </Step>
        );
      })}
    </List>
  );
}
