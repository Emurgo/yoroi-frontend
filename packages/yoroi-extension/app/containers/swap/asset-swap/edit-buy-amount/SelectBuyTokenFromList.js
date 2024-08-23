//@flow
import { useMemo, type Node } from 'react';
import { useSwap, useSwapTokensOnlyVerified } from '@yoroi/swap';
import SelectAssetDialog from '../../../../components/swap/SelectAssetDialog';
import { useSwapForm } from '../../context/swap-form';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import SwapStore from '../../../../stores/ada/SwapStore';
import { comparatorByGetter } from '../../../../coreUtils';
import { useVerifiedSwapTokens } from '../hooks';

type Props = {|
  store: SwapStore,
  onClose(): void,
  onTokenInfoChanged: (*) => void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfoBatch: (Array<string>) => { [string]: Promise<RemoteTokenInfo> },
|};

export default function SelectBuyTokenFromList({
  store,
  onClose,
  onTokenInfoChanged,
  defaultTokenInfo,
  getTokenInfoBatch,
}: Props): Node {
  const {
    sellQuantity: { isTouched: isSellTouched },
    buyQuantity: { isTouched: isBuyTouched },
    buyTokenInfo = {},
    sellTokenInfo = {},
    buyTouched,
    switchTokens,
  } = useSwapForm();

  const { walletVerifiedAssets } = useVerifiedSwapTokens(store.assets);

  const { orderData, resetQuantities } = useSwap();

  const handleAssetSelected = token => {
    const { id, decimals } = token;
    const shouldUpdateToken = id !== orderData.amounts.buy.tokenId || !isBuyTouched || decimals !== buyTokenInfo.decimals;
    const shouldSwitchTokens = id === orderData.amounts.sell.tokenId && isSellTouched;
    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      resetQuantities();
      switchTokens();
    }

    if (shouldUpdateToken) {
      onTokenInfoChanged({ decimals: decimals ?? 0, id });
      buyTouched(token);
    }

    onClose();
  };

  return (
    <SelectAssetDialog
      assets={walletVerifiedAssets}
      type="to"
      onAssetSelected={handleAssetSelected}
      onClose={onClose}
      defaultTokenInfo={defaultTokenInfo}
      getTokenInfoBatch={getTokenInfoBatch}
    />
  );
}
