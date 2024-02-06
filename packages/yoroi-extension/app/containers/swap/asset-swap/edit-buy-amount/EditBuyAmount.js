//@flow
import type { Node } from 'react';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import SwapInput from '../../../../components/swap/SwapInput';

type Props = {|
  onAssetSelect(): void,
|};

export default function EditBuyAmount({ onAssetSelect }: Props): Node {
  const { orderData } = useSwap();
  const {
    buyQuantity: { isTouched: isBuyTouched, displayValue: buyDisplayValue, error: buyError },
    buyTokenInfo = {},
    onChangeBuyQuantity,
    buyInputRef,
  } = useSwapForm();
  const { tokenId } = orderData.amounts.buy;

  return (
    <SwapInput
      key={tokenId}
      label="Swap To"
      handleAmountChange={onChangeBuyQuantity}
      value={buyDisplayValue}
      tokenInfo={buyTokenInfo}
      onAssetSelect={onAssetSelect}
      touched={isBuyTouched}
      inputRef={buyInputRef}
      error={buyError}
    />
  );
}
