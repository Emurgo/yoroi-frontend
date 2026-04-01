import React from 'react';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { GovernanceProvider as GovernanceExternalPackageProvider } from '@yoroi/staking';
import { useGovernance } from '../../features/governace/module/GovernanceContextProvider';
import { Stack } from '@mui/material';

type Props = {
  stores: any;
  children: React.ReactNode;
};

const GovernanceLayout = ({ stores, children }: Props): any => {
  const { governanceManager } = useGovernance();

  if (governanceManager)
    return (
      <GeneralPageLayout
        stores={stores}
        navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title={'Governance'} />} />}
      >
        <GovernanceExternalPackageProvider manager={governanceManager}>
          <Stack direction="column" justifyContent="space-between" alignItems="center" height="100%">
            {children}
          </Stack>
        </GovernanceExternalPackageProvider>
      </GeneralPageLayout>
    );
};

export default GovernanceLayout;
