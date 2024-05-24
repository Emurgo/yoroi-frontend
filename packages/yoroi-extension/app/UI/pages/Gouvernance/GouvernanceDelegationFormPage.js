// @flow
import { DelagationForm } from '../../features/gouvernace/useCases/DelagationForm/DelagationForm';
import GouvernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceDelegationFormPage = (props: Props): any => {
  return (
    <GouvernanceLayout {...props}>
      <DelagationForm />
    </GouvernanceLayout>
  );
};

export default GouvernanceDelegationFormPage;
