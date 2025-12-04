import { useNavigate } from 'react-router';
import { ROUTES } from '../../../routes-config';
import { TransactionSubmitted } from '../../components';
import { useStrings } from '../../features/governace/common/hooks/useStrings';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceTransactionSubmittedPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <TransactionSubmittedWrapper />
    </GovernanceLayout>
  );
};

const TransactionSubmittedWrapper = () => {
  const navigate = useNavigate();
  const strings = useStrings();

  return (
    <TransactionSubmitted
      title={strings.thanksForParticipation}
      subtitle={strings.theTransactionCanTake}
      content={strings.participatingInGovernance}
      btnText={strings.goToGovernance}
      onPress={() => navigate(ROUTES.Governance.ROOT)}
    />
  );
};

export default GovernanceTransactionSubmittedPage;
