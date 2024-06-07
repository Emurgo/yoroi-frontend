import React from 'react';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { GovernanceProvider as GovernanceExternalPackageProvider } from '@yoroi/staking';
import { useGovernance } from '../../features/governace/module/GovernanceContextProvider';

type Props = {
  stores: any;
  actions: any;
  children: React.ReactNode;
};

const GovernanceLayout = ({ stores, actions, children }: Props): any => {
  const { governanceManager } = useGovernance();

  if (governanceManager)
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
