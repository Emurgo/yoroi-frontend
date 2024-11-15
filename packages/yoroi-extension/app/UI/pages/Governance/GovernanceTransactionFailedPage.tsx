import React from 'react';
import { TransactionFailed } from '../../components/TransactionFailed/TransactionFailed';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const GovernanceTransactionFailedPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <TransactionFailed error={props.stores.substores.ada.delegationTransaction.error} />
    </GovernanceLayout>
  );
};

export default GovernanceTransactionFailedPage;
