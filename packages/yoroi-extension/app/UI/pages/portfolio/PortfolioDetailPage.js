// @flow
import React from 'react';
import TokenDetails from '../../features/portfolio/useCases/TokenDetails/TokenDetails';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioLayout from './layout';

type Props = {|
  stores: any,
  actions: any,
  match: any,
|};

const PortfolioDetailPage = ({ match, ...props }: Props) => {
  const tokenId = match.params.tokenId;

  const tokenInfo = React.useMemo(() => {
    const tmp = mockData.wallet.tokenList.find(item => item.id === tokenId);
    if (tmp) return tmp;
    return {};
  }, [tokenId]);

  return (
    <PortfolioLayout {...props}>
      <TokenDetails tokenInfo={tokenInfo} transactionHistory={mockData.transactionHistory} />
    </PortfolioLayout>
  );
};

export default PortfolioDetailPage;
