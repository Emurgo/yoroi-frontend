//@flow
import type { Node } from 'react';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import SwapInput from '../../../../components/swap/SwapInput';

type Props = {|
  onAssetSelect(): void,
|};

export default function EditSellAmount({ onAssetSelect }: Props): Node {
  const { orderData } = useSwap();
  const {
    sellQuantity: { isTouched: isSellTouched, displayValue: sellDisplayValue, error, tokenInfo },
    onChangeSellQuantity,
    sellInputRef,
  } = useSwapForm();
  const { tokenId } = orderData.amounts.sell;

  return (
    <SwapInput
      key={tokenId}
      label="Swap From"
      handleAmountChange={onChangeSellQuantity}
      value={sellDisplayValue}
      amount={tokenInfo}
      onAssetSelect={onAssetSelect}
      touched={isSellTouched}
      inputRef={sellInputRef}
      error={error}
      showMax
    />
  );
}
