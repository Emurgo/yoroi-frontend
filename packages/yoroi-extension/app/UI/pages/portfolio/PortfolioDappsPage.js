// @flow
import React from 'react';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';
import PortfolioDapps from '../../features/portfolio/useCases/Dapps/PortfolioDapps';
import mockData from '../../features/portfolio/common/mockData';

type Props = {|
  stores: any,
  actions: any,
|};

const PortfolioDappsPage = ({ stores, actions }: Props) => {
  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <PortfolioDapps data={mockData.dapps} />
    </PortfolioPageLayout>
  );
};

export default PortfolioDappsPage;
