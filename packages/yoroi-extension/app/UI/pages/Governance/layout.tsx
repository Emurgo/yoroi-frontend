import React from 'react';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { GovernanceProvider as GovernanceExternalPackageProvider, useGovernance } from '@yoroi/staking';

type Props = {
  stores: any;
  actions: any;
  children?: React.ReactNode;
};

const GovernanceLayout = ({ stores, actions, children }: Props): any => {
  const { manager } = useGovernance();

  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'Governance'} />} />}
    >
      <GovernanceExternalPackageProvider manager={manager}>{children}</GovernanceExternalPackageProvider>
    </GeneralPageLayout>
  );
};

export default GovernanceLayout;
