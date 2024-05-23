// @flow
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import GouvernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceTransactionSubmittedPage = (props: Props): any => {
  return (
    <GouvernanceLayout {...props}>
      <TransactionSubmitted />
    </GouvernanceLayout>
  );
};

export default GouvernanceTransactionSubmittedPage;
