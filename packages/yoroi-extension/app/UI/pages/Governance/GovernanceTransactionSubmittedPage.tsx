import React from 'react';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const GovernanceTransactionSubmittedPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <TransactionSubmitted />
    </GovernanceLayout>
  );
};

export default GovernanceTransactionSubmittedPage;
