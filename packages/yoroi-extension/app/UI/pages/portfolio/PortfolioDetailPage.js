// @flow
import React from 'react';
import TokenDetails from '../../features/portfolio/useCases/TokenDetails/TokenDetails';
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';
import mockData from './mockData';

type Props = {|
  stores: any,
  actions: any,
  match: any,
|};

const PortfolioDetailPage = ({ stores, actions, match }: Props) => {
  const tokenId = match.params.tokenId;

  const tokenInfo = React.useMemo(() => {
    const tmp = mockData.tokenList.find(item => item.id === tokenId);
    if (tmp) return tmp;
    return {};
  }, [tokenId]);

  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      <TokenDetails tokenInfo={tokenInfo} mockHistory={mockData.PortfolioDetailPage.history} />
    </PortfolioPageLayout>
  );
};

export default PortfolioDetailPage;
