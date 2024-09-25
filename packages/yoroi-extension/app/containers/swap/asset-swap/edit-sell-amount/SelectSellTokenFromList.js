//@flow
import { type Node } from 'react';
import { useSwap } from '@yoroi/swap';
import SelectAssetDialog from '../../../../components/swap/SelectAssetDialog';
import { useSwapForm } from '../../context/swap-form';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import SwapStore from '../../../../stores/ada/SwapStore';
import { useVerifiedSwapTokens } from '../hooks';

type Props = {|
  store: SwapStore,
  onClose(): void,
  onTokenInfoChanged: * => void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfoBatch: Array<string> => { [string]: Promise<RemoteTokenInfo> },
|};

export default function SelectSellTokenFromList({ store, onClose, onTokenInfoChanged, defaultTokenInfo, getTokenInfoBatch }: Props): Node {
  const {walletVerifiedAssets} = useVerifiedSwapTokens(store.assets)
  
  const { orderData, resetQuantities } = useSwap();
  const {
    buyQuantity: { isTouched: isBuyTouched },
    sellQuantity: { isTouched: isSellTouched },
    sellTokenInfo = {},
    sellTouched,
    switchTokens,
  } = useSwapForm();

  const handleAssetSelected = token => {
    const { id, decimals } = token;
    const shouldUpdateToken =
      id !== orderData.amounts.sell.tokenId ||
      !isSellTouched ||
      decimals !== sellTokenInfo.decimals;
    const shouldSwitchTokens = id === orderData.amounts.buy.tokenId && isBuyTouched;
    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      resetQuantities();
      switchTokens();
    }

    if (shouldUpdateToken) {
      sellTouched(token);
      onTokenInfoChanged({ id, decimals: decimals ?? 0 });
    }

    onClose();
  };

  return (
    <SelectAssetDialog
      assets={walletVerifiedAssets}
      type="from"
      onAssetSelected={handleAssetSelected}
      onClose={onClose}
      defaultTokenInfo={defaultTokenInfo}
      getTokenInfoBatch={getTokenInfoBatch}
    />
  );
}
