import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  children: ReactNode;
};

const StakingLayout = ({ stores, children }: Props): React.ReactNode => {
  return (
    <GeneralPageLayout
      stores={stores}
      navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title={'Staking Dashboard'} />} />}
    >
      {children}
    </GeneralPageLayout>
  );
};

export default StakingLayout;
