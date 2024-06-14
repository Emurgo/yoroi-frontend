//@flow
import type { Node } from 'react';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import SwapInput from '../../../../components/swap/SwapInput';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';

type Props = {|
  onAssetSelect(): void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
|};

export default function EditBuyAmount({
  onAssetSelect,
  defaultTokenInfo,
  getTokenInfo,
}: Props): Node {
  const { orderData } = useSwap();
  const {
    buyQuantity: { displayValue: buyDisplayValue, error: fieldError },
    sellTokenInfo = {},
    buyTokenInfo = {},
    onChangeBuyQuantity,
    buyFocusState,
  } = useSwapForm();
  const { tokenId } = orderData.amounts.buy;

  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  const isInvalidPair = isValidTickers && orderData.selectedPoolCalculation == null;
  const error = isInvalidPair ? 'Selected pair is not available in any liquidity pool' : fieldError;

  // Amount input is blocked in case invalid pair
  const handleAmountChange = () => {
    return isInvalidPair ? () => {} : onChangeBuyQuantity;
  };

  return (
    <SwapInput
      key={tokenId}
      label="Swap to"
      disabled={!isValidTickers}
      handleAmountChange={handleAmountChange()}
      value={buyDisplayValue}
      tokenInfo={buyTokenInfo}
      defaultTokenInfo={defaultTokenInfo}
      getTokenInfo={getTokenInfo}
      onAssetSelect={onAssetSelect}
      focusState={buyFocusState}
      error={error}
    />
  );
}
