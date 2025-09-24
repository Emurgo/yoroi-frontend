import { observer } from 'mobx-react';
import React from 'react';
import { usePortfolio } from '../../features/portfolio/module/PortfolioContextProvider';
import TokenDetails from '../../features/portfolio/useCases/TokenDetails/TokenDetails';
import PortfolioLayout from './layout';
import { useParams } from 'react-router';
import { useNavigateTo } from '../../features/nfts/common/hooks/useNavigateTo';

type Props = {
  stores: any;
};

const PortfolioDetailPage = observer(({ stores, ...props }: Props) => {
  const navigateTo = useNavigateTo();

  const selectedWallet = stores.wallets.selected;

  const { tokenId } = useParams<{ tokenId: string }>();

  const { ftAssetList } = usePortfolio();

  const tokenInfo = React.useMemo(() => {
    const token = ftAssetList.find(item => item.id === tokenId);
    if (token) {
      return token;
    }
    // If there is no token data, we should move to portfolio page
    navigateTo.portfolioRoot();
    return {};
  }, [tokenId, selectedWallet]);

  return (
    <PortfolioLayout {...props} stores={stores}>
      <TokenDetails tokenInfo={tokenInfo} stores={stores} />
    </PortfolioLayout>
  );
});

export default PortfolioDetailPage;
