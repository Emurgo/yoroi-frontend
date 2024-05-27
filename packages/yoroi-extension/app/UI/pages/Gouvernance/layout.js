// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { GouvernanceStatusSelection } from '../../features/gouvernace/useCases/SelectGouvernanceStatus/GouvernanceStatusSelection';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBar from '../../../components/topbar/NavBar';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import { GovernanceProvider } from '@yoroi/staking';
import { useGovernance } from '../../features/gouvernace/module/GouvernanceContextProvider';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceLayout = ({ stores, actions, children }: Props): any => {
  const { gouvernanceManager } = useGovernance();

  console.log('gouvernanceManager', gouvernanceManager);
  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'Governance'} />} />}
      // menu={menu} // ADD a menu if needed (see example in SwapPageContainer)
    >
      <GovernanceProvider manager={gouvernanceManager}>{children}</GovernanceProvider>
    </GeneralPageLayout>
  );
};

export default GouvernanceLayout;
