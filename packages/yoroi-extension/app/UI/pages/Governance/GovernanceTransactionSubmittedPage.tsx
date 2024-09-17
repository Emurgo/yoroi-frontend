import React from 'react';
import { useHistory } from 'react-router';
import { ROUTES } from '../../../routes-config';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import { useStrings } from '../../features/governace/common/useStrings';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
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
  const history = useHistory();
  const strings = useStrings();
  return (
    <TransactionSubmitted
      title={strings.thanksForParticipation}
      subtitle={strings.theTransactionCanTake}
      content={strings.participatingInGovernance}
      btnText={strings.goToGovernance}
      onPress={() => history.push(ROUTES.Governance.ROOT)}
    />
  );
};

export default GovernanceTransactionSubmittedPage;
