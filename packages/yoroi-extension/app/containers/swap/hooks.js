//@flow
import { useMemo } from 'react';
import adaLogo from './mockAssets/ada.inline.svg';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenName, } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import useSwapPage from './context/swap-page/useSwapPage';
import { useSwap, useSwapPoolsByPair } from '@yoroi/swap';
import { Quantities } from '../../utils/quantities';
import { useSwapForm } from './context/swap-form';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';

export function useAssets(): Array<any> {
  const { spendableBalance, tokenInfo } = useSwapPage();
  const getTokenInfo = genLookupOrFail(tokenInfo);

  const assetsList = useMemo(() => {
    if (spendableBalance == null) return [];
    return [spendableBalance.getDefaultEntry()]
      .concat(...spendableBalance.nonDefaultEntries())
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(t => !Boolean(t.info.IsNFT))
      .map(token => {
        const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
        const id = token.info.Identifier;
        const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
        const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
        return {
          id,
          group: token.info?.Metadata.policyId,
          fingerprint: getTokenIdentifierIfExists(token.info) ?? '',
          name: id == null
            ? token.info?.Metadata.ticker
            : truncateToken(getTokenName(token.info)),
          decimals: token.info?.Metadata.numberOfDecimals,
          ticker: token.info?.Metadata.ticker ?? truncateToken(getTokenName(token.info)),
          kind: token.info?.IsNFT ? 'nft' : 'ft',
          amount: [beforeDecimal, afterDecimal].join(''),
          amountForSorting: shiftedAmount,
          description: '',
          metadatas: token.info?.Metadata,
          image: id ? '' : adaLogo,
        };
      });
  }, [spendableBalance, getTokenInfo]);

  return assetsList;
}

export async function useAsyncPools(tokenA: string, tokenB: string): Promise<void> {
  const { poolPairsChanged } = useSwap();
  useSwapPoolsByPair(
    { tokenA, tokenB },
    {
      onSuccess: pools => {
        poolPairsChanged(pools);
      },
    }
  );
}

export function useSwapFeeDisplay(defaultTokenInfo: RemoteTokenInfo): {|
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
      formattedNonPtAmount: null
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
    const ptAmount = Quantities.sum([sellAmount, totalFeesPtToken]);
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

  const formattedSell = Quantities.format(sellAmount, sellDecimals, sellDecimals) + ` ${sellTicker}`;
  return {
    ptAmount: totalFeesPtToken,
    formattedPtAmount: formattedFee,
    nonPtAmount: sellAmount,
    formattedNonPtAmount: formattedSell,
    formattedFee,
  };
}
