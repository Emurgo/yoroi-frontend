import React from 'react';
import { DelagationForm } from '../../features/governace/useCases/DelagationForm/DelagationForm';
import GovernanceLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  children?: any;
};

const GovernanceDelegationFormPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <DelagationForm />
    </GovernanceLayout>
  );
};

export default GovernanceDelegationFormPage;
