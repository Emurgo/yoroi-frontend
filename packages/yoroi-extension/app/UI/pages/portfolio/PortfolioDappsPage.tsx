import React from 'react';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioDapps from '../../features/portfolio/useCases/Dapps/PortfolioDapps';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
  actions: any;
};

const PortfolioDappsPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioDapps data={mockData.dapps} stores={props.stores} />
    </PortfolioLayout>
  );
};

export default PortfolioDappsPage;
