// @flow
import React from 'react';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';

type Props = {|
  stores: any,
  actions: any,
|};

const PortfolioDappsPage = ({ stores, actions }: Props) => {
  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <div>PortfolioDappsPage</div>
    </PortfolioPageLayout>
  );
};

export default PortfolioDappsPage;
