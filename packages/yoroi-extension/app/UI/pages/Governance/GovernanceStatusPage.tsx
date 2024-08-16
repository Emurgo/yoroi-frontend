import React from 'react';
import { GovernanceStatusSelection } from '../../features/governace/useCases/SelectGovernanceStatus/GovernanceStatusSelection';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const GovernanceStatusPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <GovernanceStatusSelection />
    </GovernanceLayout>
  );
};

export default GovernanceStatusPage;
