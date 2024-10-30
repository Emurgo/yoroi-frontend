import React from 'react';
import PortfolioWallet from '../../features/portfolio/useCases/Wallet/PortfolioWallet';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
  actions: any;
};

const PortfolioPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioWallet />
    </PortfolioLayout>
  );
};

export default PortfolioPage;
