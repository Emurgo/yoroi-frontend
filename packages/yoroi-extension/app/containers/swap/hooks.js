//@flow
import { useState } from 'react';
import {
  useSwap,
  useSwapOrdersByStatusCompleted,
  useSwapOrdersByStatusOpen,
  useSwapPoolsByPair,
  useSwapTokensOnlyVerified,
} from '@yoroi/swap';
import { Quantities } from '../../utils/quantities';
import { useSwapForm } from './context/swap-form';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { runInAction } from 'mobx';

export async function useAsyncPools(tokenA: string, tokenB: string): Promise<void> {
  const { poolPairsChanged } = useSwap();
  const [prevUsedPair, setPrevUsedPair] = useState<?string>(null);
  const pair = `${tokenA}:${tokenB}`;
  const isSamePair = prevUsedPair === pair;
  useSwapPoolsByPair(
    { tokenA, tokenB },
    {
      onSuccess: pools => {
        if (!isSamePair) {
          runInAction(() => {
            setPrevUsedPair(pair);
            poolPairsChanged(pools);
          });
        }
      },
    }
  );
}

export function useSwapFeeDisplay(
  defaultTokenInfo: RemoteTokenInfo
): {|
  formattedFee: string,
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

  const formattedFee = Quantities.format(totalFeesPtToken, ptDecimals, ptDecimals) + ` ${ptTicker}`;

  if (sellTokenIsPtToken) {
    // put together the sell and the fees
    const ptAmount = Quantities.sum([sellAmount, totalFeesPtToken, cost.deposit.quantity]);
    const formattedPtTotal = Quantities.format(ptAmount, ptDecimals, ptDecimals);
    const formattedPtAmount = `${formattedPtTotal} ${ptTicker}`;
    return {
      ptAmount,
      formattedPtAmount,
      formattedFee,
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

export function useRichOpenOrders(): any {
  try {
    const openOrders = useSwapOrdersByStatusOpen();
    if (openOrders?.length === 0) return [];
    const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
    if (onlyVerifiedTokens.length === 0) return [];
    const tokensMap = onlyVerifiedTokens.reduce((map, t) => ({ ...map, [t.id]: t }), {});
    return openOrders.map(o => {
      const fromToken = tokensMap[o.from.tokenId];
      const toToken = tokensMap[o.to.tokenId];
      return {
        utxo: o.utxo,
        from: { quantity: o.from.quantity, token: fromToken },
        to: { quantity: o.to.quantity, token: toToken },
        batcherFee: o.batcherFee,
        valueAttached: o.valueAttached,
        deposit: o.deposit,
        provider: o.provider,
        sender: o.sender,
      };
    });
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export function useRichCompletedOrders(): any {
  try {
    const completedOrders = useSwapOrdersByStatusCompleted();
    if (completedOrders?.length === 0) return [];
    const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
    const tokensMap = onlyVerifiedTokens.reduce((map, t) => ({ ...map, [t.id]: t }), {});
    return completedOrders.map(o => {
      const fromToken = tokensMap[o.from.tokenId];
      const toToken = tokensMap[o.to.tokenId];
      return {
        txHash: o.txHash,
        from: { quantity: o.from.quantity, token: fromToken },
        to: { quantity: o.to.quantity, token: toToken },
      };
    });
  } catch (error) {
    console.warn(error);
    return [];
  }
}
