import React from 'react';
import { DelagationForm } from '../../features/governace/useCases/DelagationForm/DelagationForm';
import GovernanceLayout from './layout';
import { useGovernance } from '../../features/governace/module/GovernanceContextProvider';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceDelegationFormPage = (props: Props): any => {

  const { ampli } = useGovernance();
  React.useEffect(() => {
    // ON MOUNT
    ampli?.governanceConfirmTransactionPageViewed();
  }, []);

  return (
    <GovernanceLayout {...props}>
      <DelagationForm />
    </GovernanceLayout>
  );
};

export default GovernanceDelegationFormPage;
