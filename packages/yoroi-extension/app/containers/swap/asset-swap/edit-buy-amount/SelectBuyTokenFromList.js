//@flow
import { useMemo, type Node } from 'react';
import { useSwap, useSwapTokensOnlyVerified } from '@yoroi/swap';
import SelectAssetDialog from '../../../../components/swap/SelectAssetDialog';
import { useSwapForm } from '../../context/swap-form';
import { useAssets } from '../../hooks';

// eslint-disable-next-line import/no-unresolved
import type { SimpleTokenInfo } from '@yoroi/swap/lib/typescript/translators/reactjs/state/state';

type Props = {|
  onClose(): void,
  onTokenInfoChanged: SimpleTokenInfo => void;
|};

export default function SelectBuyTokenFromList({ onClose, onTokenInfoChanged }: Props): Node {
  const {
    sellQuantity: { isTouched: isSellTouched },
    buyQuantity: { isTouched: isBuyTouched },
    buyTokenInfo = {},
    sellTokenInfo = {},
    buyTouched,
    switchTokens,
  } = useSwapForm();

  const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
  const walletAssets = useAssets();

  const walletVerifiedAssets = useMemo(() => {
    const isSellingPt = sellTokenInfo.id === '' && sellTokenInfo.decimals === 6;
    const pt = walletAssets.find(a => a.id === '');
    return [isSellingPt ? undefined : pt]
      .concat(
        onlyVerifiedTokens.map(ovt => {
          const vft = walletAssets.find(a => a.fingerprint === ovt.fingerprint);
          if (vft) return { ...ovt, ...vft };
          return ovt;
        })
      )
      .filter(Boolean);
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
    />
  );
}
