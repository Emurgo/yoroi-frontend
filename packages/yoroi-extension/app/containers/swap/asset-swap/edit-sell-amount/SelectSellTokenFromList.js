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
  getTokenInfo: string => Promise<RemoteTokenInfo>,
|};

export default function SelectSellTokenFromList({ store, onClose, onTokenInfoChanged, defaultTokenInfo, getTokenInfo }: Props): Node {
  const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
  const assets = store.assets;
  const walletVerifiedAssets = useMemo(() => {
    return assets.map(a => {
      const vft = onlyVerifiedTokens.find(ovt => ovt.fingerprint === a.fingerprint);
      return a.id === '' || vft ? { ...a, ...vft } : undefined;
    }).filter(Boolean).sort(comparatorByGetter(a => a.name?.toLowerCase()));
  }, [onlyVerifiedTokens, assets]);

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
      getTokenInfo={getTokenInfo}
    />
  );
}
