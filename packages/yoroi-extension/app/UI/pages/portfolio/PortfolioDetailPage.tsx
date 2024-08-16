import React from 'react';
import mockData from '../../features/portfolio/common/mockData';
import PortfolioLayout from './layout';
import TokenDetails from './../../features/portfolio/useCases/TokenDetails/TokenDetails';
import { TokenType } from '../../features/portfolio/common/types';

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
    return {} as TokenType;
  }, [tokenId]);

  return (
    <PortfolioLayout {...props}>
      <TokenDetails tokenInfo={tokenInfo} />
    </PortfolioLayout>
  );
};

export default PortfolioDetailPage;
