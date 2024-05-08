//@flow
import { useMemo, type Node } from 'react';
import { useSwap, useSwapTokensOnlyVerified } from '@yoroi/swap';
import SelectAssetDialog from '../../../../components/swap/SelectAssetDialog';
import { useSwapForm } from '../../context/swap-form';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import SwapStore from '../../../../stores/ada/SwapStore';
import { comparatorByGetter } from '../../../../coreUtils';

type Props = {|
  store: SwapStore,
  onClose(): void,
  onTokenInfoChanged: * => void,
  defaultTokenInfo: RemoteTokenInfo,
|};

export default function SelectBuyTokenFromList({ store, onClose, onTokenInfoChanged, defaultTokenInfo }: Props): Node {
  const {
    sellQuantity: { isTouched: isSellTouched },
    buyQuantity: { isTouched: isBuyTouched },
    buyTokenInfo = {},
    sellTokenInfo = {},
    buyTouched,
    switchTokens,
  } = useSwapForm();

  const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
  const walletAssets = store.assets;

  const walletVerifiedAssets = useMemo(() => {
    const isSellingPt = sellTokenInfo.id === '';
    const pt = walletAssets.find(a => a.id === '');
    const nonPtAssets = onlyVerifiedTokens.map(ovt => {
      if (ovt.id === '') return null;
      const vft = walletAssets.find(a => a.fingerprint === ovt.fingerprint);
      return { ...ovt, ...(vft ?? {}) };
    }).filter(Boolean).sort(comparatorByGetter(a => a.name?.toLowerCase()));
    return [...(isSellingPt ? [] : [pt]), ...nonPtAssets];
  }, [onlyVerifiedTokens, walletAssets, sellTokenInfo]);

  const { orderData, resetQuantities } = useSwap();

  const handleAssetSelected = token => {
    const { id, decimals } = token;
    const shouldUpdateToken =
      id !== orderData.amounts.buy.tokenId || !isBuyTouched || decimals !== buyTokenInfo.decimals;
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
    />
  );
}
