import { TransactionFailed } from '../../components';
import { useNavigateTo } from '../../features/governace/common/useNavigateTo';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceTransactionFailedPage = (props: Props): any => {
  const navigate = useNavigateTo();

  return (
    <GovernanceLayout {...props}>
      <TransactionFailed error={props.stores.substores.ada.delegationTransaction.error} onNext={() => navigate.selectStatus()} />
    </GovernanceLayout>
  );
};

export default GovernanceTransactionFailedPage;
