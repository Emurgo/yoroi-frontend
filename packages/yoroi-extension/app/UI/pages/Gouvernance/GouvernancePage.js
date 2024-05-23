// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { GouvernanceStatusSelection } from '../../features/gouvernace/useCases/SelectGouvernanceStatus/GouvernanceStatusSelection';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBar from '../../../components/topbar/NavBar';
import NavBarTitle from '../../../components/topbar/NavBarTitle';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernancePage = ({ stores, actions, children }: Props): any => {
  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={
        <NavBarContainerRevamp
          actions={actions}
          stores={stores}
          title={<NavBarTitle title={'Governance'} />}
        />
      }
      // menu={menu} // ADD a menu if needed (see example in SwapPageContainer)
    >
      <GouvernanceStatusSelection />
    </GeneralPageLayout>
  );
};

export default GouvernancePage;
