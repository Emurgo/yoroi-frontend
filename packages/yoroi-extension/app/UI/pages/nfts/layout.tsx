import React, { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  actions: any;
  children: ReactNode;
};

const NftsLayout = ({ stores, actions, children }: Props): JSX.Element => {
  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'NFT Gallery'} />} />}
    >
      {children}
    </GeneralPageLayout>
  );
};

export default NftsLayout;
