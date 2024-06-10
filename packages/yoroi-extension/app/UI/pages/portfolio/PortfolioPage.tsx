// @flow
import React from 'react';
import PortfolioWallet from '../../features/portfolio/useCases/Wallet/PortfolioWallet';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
  actions: any;
};

const PortfolioPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioWallet data={mockData.wallet.tokenList} />
    </PortfolioLayout>
  );
};

export default PortfolioPage;
