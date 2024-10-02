import React from 'react';
import { usePortfolio } from '../../features/portfolio/module/PortfolioContextProvider';
import TokenDetails from './../../features/portfolio/useCases/TokenDetails/TokenDetails';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
  actions: any;
  match: any;
};

const PortfolioDetailPage = ({ match, ...props }: Props) => {
  const tokenId = match.params.tokenId;

  const { ftAssetList } = usePortfolio();

  const tokenInfo = React.useMemo(() => {
    const token = ftAssetList.find(item => item.id === tokenId);
    if (token) return token;
    return {};
  }, [tokenId]);

  return (
    <PortfolioLayout {...props}>
      <TokenDetails tokenInfo={tokenInfo} />
    </PortfolioLayout>
  );
};

export default PortfolioDetailPage;
