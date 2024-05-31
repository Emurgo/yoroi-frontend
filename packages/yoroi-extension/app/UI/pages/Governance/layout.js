// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { GovernanceStatusSelection } from '../../features/governace/useCases/SelectGovernanceStatus/GovernanceStatusSelection';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBar from '../../../components/topbar/NavBar';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';
import { GovernanceProvider as GovernanceExternalPackageProvider } from '@yoroi/staking';
import { useGovernance } from '../../features/governace/module/GovernanceContextProvider';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GovernanceLayout = ({ stores, actions, children }: Props): any => {
  const { governanceManager } = useGovernance();

  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'Governance'} />} />}
    >
      <GovernanceExternalPackageProvider manager={governanceManager}>{children}</GovernanceExternalPackageProvider>
    </GeneralPageLayout>
  );
};

export default GovernanceLayout;
