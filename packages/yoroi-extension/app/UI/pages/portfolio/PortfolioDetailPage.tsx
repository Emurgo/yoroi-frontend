// @flow
import React from 'react';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioLayout from './layout';
import TokenDetails from './../../features/portfolio/useCases/TokenDetails/TokenDetails';

type Props = {
  stores: any;
  actions: any;
  match: any;
};

const PortfolioDetailPage = ({ match, ...props }: Props) => {
  const tokenId = match.params.tokenId;

  const tokenInfo = React.useMemo(() => {
    const tmp = mockData.wallet.tokenList.find(item => item.id === tokenId);
    if (tmp) return tmp;
    return null;
  }, [tokenId]);

  return (
    <PortfolioLayout {...props}>
      <TokenDetails tokenInfo={tokenInfo || null} />
    </PortfolioLayout>
  );
};

export default PortfolioDetailPage;
