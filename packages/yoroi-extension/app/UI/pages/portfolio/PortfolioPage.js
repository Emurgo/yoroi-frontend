// @flow
import React from 'react';
import PortfolioWallet from '../../features/portfolio/useCases/Wallet/PortfolioWallet';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';
import mockData from '../../features/portfolio/common/mockData';

type Props = {|
  stores: any,
  actions: any,
|};

const PortfolioPage = ({ stores, actions }: Props) => {
  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <PortfolioWallet data={mockData.wallet.tokenList} />
    </PortfolioPageLayout>
  );
};

export default PortfolioPage;
