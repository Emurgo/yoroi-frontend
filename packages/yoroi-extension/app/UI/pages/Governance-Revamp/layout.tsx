import React from 'react';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import { GovernanceProvider as GovernanceExternalPackageProvider } from '@yoroi/staking';
import { useGovernance } from '../../features/governace/module/GovernanceContextProvider';
import { Link, Stack } from '@mui/material';
import { useStrings } from '../../features/governace/common/hooks/useStrings';
import { LEARN_MORE_LINK } from '../../features/governace/common/constants';

type Props = {
  stores: any;
  children: React.ReactNode;
};

const GovernanceLayout = ({ stores, children }: Props): any => {
  const { governanceManager } = useGovernance();
  const strings = useStrings();

  if (governanceManager)
    return (
      <GeneralPageLayout
        stores={stores}
        navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title={'Governance'} />} />}
      >
        <GovernanceExternalPackageProvider manager={governanceManager}>
          <Stack direction="column" justifyContent="space-between" alignItems="center" height="100%">
            {children}
            <Link sx={{ cursor: 'pointer' }} href={LEARN_MORE_LINK} target="_blank" rel="noopener">
              {strings.learnMoreLabel}
            </Link>
          </Stack>
        </GovernanceExternalPackageProvider>
      </GeneralPageLayout>
    );
};

export default GovernanceLayout;
