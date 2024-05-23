// @flow
import React from 'react';
import PortfolioWallet from '../../features/portfolio/useCases/Wallet/PortfolioWallet';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';
import mockData from './mockData';

type Props = {|
  stores: any,
  actions: any,
|};

const PortfolioPage = ({ stores, actions }: Props) => {

  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <PortfolioWallet
        headCells={mockData.PortfolioPage.headCells}
        data={mockData.PortfolioPage.data}
      />
    </PortfolioPageLayout>
  );
};

export default PortfolioPage;
