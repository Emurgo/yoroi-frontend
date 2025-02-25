import React from 'react';
import { Warning } from '../../../../components/Warning/Warning';

export const useWarningSection = (warning: { kind: 'undelegate' }) => {
  if (!warning || !warning.kind) {
    return null;
  }
  switch (warning.kind) {
    case 'undelegate':
      return (
        <Warning
          title="Attention"
          content="Our rewards will automatically get withdrawn once you undelegate from a stake pool. You will also receive back your staking deposit of 2 ADA. If you wish to choose another stake pool, you can change your preference without undelegation."
        />
      );

    default:
      return null;
  }
};
