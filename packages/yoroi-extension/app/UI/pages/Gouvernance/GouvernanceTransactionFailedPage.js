// @flow
import { TransactionFailed } from '../../components/TransactionFailed/TransactionFailed';
import GouvernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceTransactionFailedPage = (props: Props): any => {
  return (
    <GouvernanceLayout {...props}>
      <TransactionFailed />
    </GouvernanceLayout>
  );
};

export default GouvernanceTransactionFailedPage;
