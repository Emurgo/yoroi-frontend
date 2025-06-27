//@flow
import type { Node } from 'react';
import { useSwap } from 'legacySwap';
import { useSwapForm } from '../../context/swap-form';
import SwapInput from '../../../../components/swap/SwapInput';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import { Box } from '@mui/material';
import { useStrings } from '../../common/useStrings';

type Props = {|
  onAssetSelect(): void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
|};

export default function EditSellAmount({ onAssetSelect, defaultTokenInfo, getTokenInfo }: Props): Node {
  const { orderData } = useSwap();
  const {
    sellQuantity: { displayValue: sellDisplayValue, error },
    sellTokenInfo = {},
    buyTokenInfo = {},
    onChangeSellQuantity,
    sellFocusState,
  } = useSwapForm();
  const strings = useStrings();
  const { tokenId } = orderData.amounts.sell;

  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;

  return (
    <Box>
      <SwapInput
        key={tokenId}
        label={strings.swapFromLabel}
        disabled={!isValidTickers}
        handleAmountChange={onChangeSellQuantity}
        value={sellDisplayValue}
        tokenInfo={sellTokenInfo}
        defaultTokenInfo={defaultTokenInfo}
        getTokenInfo={getTokenInfo}
        onAssetSelect={onAssetSelect}
        focusState={sellFocusState}
        error={error}
        showMax
      />
    </Box>
  );
}
