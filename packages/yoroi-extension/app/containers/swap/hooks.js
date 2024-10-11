//@flow
import {
  useSwap,
} from '@yoroi/swap';
import { Quantities } from '../../utils/quantities';
import { useSwapForm } from './context/swap-form';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';

export function useSwapFeeDisplay(
  defaultTokenInfo: RemoteTokenInfo
): {|
  formattedFee: string,
  formattedFeeQuantity: string,
  ptAmount: string,
  formattedPtAmount: string,
  nonPtAmount: ?string,
  formattedNonPtAmount: ?string,
|} {
  const { orderData } = useSwap();
  const { selectedPoolCalculation, amounts } = orderData ?? {};
  const { cost } = selectedPoolCalculation ?? {};
  const { sellTokenInfo } = useSwapForm();

  if (cost == null) {
    return {
      formattedFee: '',
      formattedFeeQuantity: '',
      ptAmount: '',
      formattedPtAmount: '',
      nonPtAmount: null,
      formattedNonPtAmount: null,
    };
  }

  const sellTokenIsPtToken = amounts.sell.tokenId === '';

  const ptDecimals = defaultTokenInfo.decimals ?? 0;
  const ptTicker = defaultTokenInfo.ticker ?? '';
  const sellDecimals = sellTokenInfo?.decimals ?? 0;
  const sellTicker = sellTokenInfo?.ticker ?? '';

  const sellAmount = amounts.sell.quantity;
  const totalFeesPtToken = Quantities.sum([
    cost.batcherFee.quantity,
    cost.frontendFeeInfo.fee.quantity,
  ]);

  const formattedFeeQuantity = Quantities.format(totalFeesPtToken, ptDecimals, ptDecimals);
  const formattedFee = formattedFeeQuantity + ` ${ptTicker}`;

  if (sellTokenIsPtToken) {
    // put together the sell and the fees
    const ptAmount = Quantities.sum([sellAmount, totalFeesPtToken, cost.deposit.quantity]);
    const formattedPtTotal = Quantities.format(ptAmount, ptDecimals, ptDecimals);
    const formattedPtAmount = `${formattedPtTotal} ${ptTicker}`;
    return {
      ptAmount,
      formattedPtAmount,
      formattedFee,
      formattedFeeQuantity,
      nonPtAmount: null,
      formattedNonPtAmount: null,
    };
  }

  const formattedSell =
    Quantities.format(sellAmount, sellDecimals, sellDecimals) + ` ${sellTicker}`;
  return {
    ptAmount: totalFeesPtToken,
    formattedPtAmount: formattedFee,
    nonPtAmount: sellAmount,
    formattedNonPtAmount: formattedSell,
    formattedFee,
  };
}
