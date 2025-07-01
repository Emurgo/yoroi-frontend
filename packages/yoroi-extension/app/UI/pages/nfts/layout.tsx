import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  children: ReactNode;
};

const NftsLayout = ({ stores, children }: Props): React.ReactNode => {
  return (
    <GeneralPageLayout
      stores={stores}
      navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title={'NFT Gallery'} />} />}
    >
      {children}
    </GeneralPageLayout>
  );
};

export default NftsLayout;
