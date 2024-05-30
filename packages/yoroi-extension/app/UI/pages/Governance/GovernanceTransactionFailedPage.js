// @flow
import { TransactionFailed } from '../../components/TransactionFailed/TransactionFailed';
import GovernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GovernanceTransactionFailedPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <TransactionFailed />
    </GovernanceLayout>
  );
};

export default GovernanceTransactionFailedPage;
