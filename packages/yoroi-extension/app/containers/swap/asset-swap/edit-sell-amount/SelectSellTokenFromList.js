//@flow
import { useMemo, type Node } from 'react';
import { useSwap, useSwapTokensOnlyVerified } from '@yoroi/swap';
import SelectAssetDialog from '../../../../components/swap/SelectAssetDialog';
import { useSwapForm } from '../../context/swap-form';
import { useAssets } from '../../hooks';

type Props = {|
  onClose(): void,
|};

export default function SelectSellTokenFromList({ onClose }: Props): Node {
  const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
  const assets = useAssets();
  const walletVerifiedAssets = useMemo(() => {
    return assets
      .map(a => {
        const vft = onlyVerifiedTokens.find(ovt => ovt.fingerprint === a.fingerprint);
        if (a.id === '' || vft) return { ...a, ...vft };
        return undefined;
      })
      .filter(Boolean);
  }, [onlyVerifiedTokens, assets]);

  const { sellTokenInfoChanged, orderData, resetQuantities } = useSwap();
  const {
    buyQuantity: { isTouched: isBuyTouched },
    sellQuantity: { isTouched: isSellTouched },
    sellTouched,
    switchTokens,
  } = useSwapForm();

  const handleAssetSelected = token => {
    const { id, decimals } = token;
    const shouldUpdateToken = id !== orderData.amounts.sell.tokenId || !isSellTouched;
    const shouldSwitchTokens = id === orderData.amounts.buy.tokenId && isBuyTouched;
    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      resetQuantities();
      switchTokens();
    }

    if (shouldUpdateToken) {
      sellTouched(token);
      sellTokenInfoChanged({ id, decimals: decimals ?? 0 });
    }

    onClose();
  };

  return (
    <SelectAssetDialog
      assets={walletVerifiedAssets}
      type="from"
      onAssetSelected={handleAssetSelected}
      onClose={onClose}
    />
  );
}
