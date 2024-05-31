// @flow
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import GovernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GovernanceTransactionSubmittedPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <TransactionSubmitted />
    </GovernanceLayout>
  );
};

export default GovernanceTransactionSubmittedPage;
