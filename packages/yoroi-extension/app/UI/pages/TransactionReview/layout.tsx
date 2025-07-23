import React from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { useStrings } from '../../common/hooks/useStrings';

type Props = {
  stores: any;
  children: React.ReactNode;
};

const TransactionReviewLayout = ({ stores, children }: Props): any => {
  const strings = useStrings();
  return (
    <GeneralPageLayout
      stores={stores}
      navbar={
        <NavBarContainerRevamp stores={stores} title={<NavBarTitle title={strings.transactionReview} />} />
      }
    >
      {children}
    </GeneralPageLayout>
  );
};

export default TransactionReviewLayout;
