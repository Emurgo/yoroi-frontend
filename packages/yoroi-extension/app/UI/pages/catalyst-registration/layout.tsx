import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  children: ReactNode;
};

const CatalystRegistrationLayout = ({ stores, children }: Props): JSX.Element => {
  return (
    <GeneralPageLayout
      stores={stores}
      navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title={'Catalyst Registration'} />} />}
    >
      {children}
    </GeneralPageLayout>
  );
};

export default CatalystRegistrationLayout;
