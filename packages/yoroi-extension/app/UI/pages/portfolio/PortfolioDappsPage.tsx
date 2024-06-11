import React from 'react';
import PortfolioDapps from '../../features/portfolio/useCases/Dapps/PortfolioDapps';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
  actions: any;
};

const PortfolioDappsPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioDapps data={mockData.dapps} />
    </PortfolioLayout>
  );
};

export default PortfolioDappsPage;
