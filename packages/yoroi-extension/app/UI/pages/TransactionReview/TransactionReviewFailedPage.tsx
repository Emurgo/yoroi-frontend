import React from 'react';
import { TransactionFailed } from '../../components/TransactionFailed/TransactionFailed';
import { useNavigateTo } from '../../features/transaction-review/common/hooks/useNavigateTo';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const TransactionReviewFailedPage = (props: Props): any => {
  const navigate = useNavigateTo();

  return (
    <GovernanceLayout {...props}>
      <TransactionFailed
        error={props.stores.substores.ada.delegationTransaction.error}
        onNext={() => navigate.transactionFail()}
      />
    </GovernanceLayout>
  );
};

export default TransactionReviewFailedPage;
