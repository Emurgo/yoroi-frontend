import React from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  actions: any;
  children: React.ReactNode;
};

const TransactionReviewLayout = ({ stores, actions, children }: Props): any => {
  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'Transaction Review'} />} />}
    >
      {children}
    </GeneralPageLayout>
  );
};

export default TransactionReviewLayout;
