// @flow
import { GouvernanceStatusSelection } from '../../features/gouvernace/useCases/SelectGouvernanceStatus/GouvernanceStatusSelection';
import GouvernanceLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernancePage = (props: Props): any => {
  return (
    <GouvernanceLayout {...props}>
      <GouvernanceStatusSelection />
    </GouvernanceLayout>
  );
};

export default GouvernancePage;
