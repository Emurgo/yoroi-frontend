// @flow
import { DelagationForm } from '../../features/governace/useCases/DelagationForm/DelagationForm';
import GovernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GovernanceDelegationFormPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <DelagationForm />
    </GovernanceLayout>
  );
};

export default GovernanceDelegationFormPage;
