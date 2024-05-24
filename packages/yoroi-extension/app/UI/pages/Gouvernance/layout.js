// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { GouvernanceStatusSelection } from '../../features/gouvernace/useCases/SelectGouvernanceStatus/GouvernanceStatusSelection';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBar from '../../../components/topbar/NavBar';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { TransactionSubmitted } from '../../components/TransactionSubmitted/TransactionSubmitted';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceLayout = ({ stores, actions, children }: Props): any => {
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
      {children}
    </GeneralPageLayout>
  );
};

export default GouvernanceLayout;
