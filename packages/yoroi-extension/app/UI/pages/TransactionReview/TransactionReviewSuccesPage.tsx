import React from 'react';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import { useNavigateTo } from '../../features/transaction-review/common/hooks/useNavigateTo';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const TransactionReviewSuccesPage = (props: Props): any => {
  const navigate = useNavigateTo();

  return (
    <GovernanceLayout {...props}>
      <TransactionSubmitted
        title="Transaction Submitted"
        btnText="Go to Transaction"
        onPress={() => navigate.walletTransactions()}
      />
    </GovernanceLayout>
  );
};

export default TransactionReviewSuccesPage;
