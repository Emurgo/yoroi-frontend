//@flow
import { useSwap, } from '@yoroi/swap';
import { useQuery } from 'react-query';
import { useEffect, useState } from 'react';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { Quantities } from '../../../utils/quantities';
import { PRICE_PRECISION } from '../../../components/swap/common';
import { maybe } from '../../../coreUtils';
import type { FormattedTokenValue, OrderAsset } from './util';
import { createFormattedTokenValues } from './util';

function mapOrderAssets(
  from: OrderAsset,
  to: OrderAsset,
  valueAttached: ?any,
  defaultTokenInfo: RemoteTokenInfo
): {|
  price: string,
  amount: string,
  totalValues: ?Array<FormattedTokenValue>,
  from: any,
  to: any,
|} {
  const price = Quantities.quotient(from.quantity, from.quantity);
  const fromDecimals = from.token?.decimals ?? 0;
  const toDecimals = to.token?.decimals ?? 0;
  const priceDenomination = fromDecimals - toDecimals;
  const formattedPrice = Quantities.format(price, priceDenomination, PRICE_PRECISION);
  const formattedToQuantity = Quantities.format(
    to.quantity,
    toDecimals,
    toDecimals
  );
  const formattedAttachedValues = maybe(valueAttached, val =>
    createFormattedTokenValues({
      entries: val.map(({ token: id, amount }) => ({ id, amount })),
      from,
      to,
      defaultTokenInfo,
    })
  );
  return {
    price: formattedPrice,
    amount: formattedToQuantity,
    totalValues: formattedAttachedValues,
    from,
    to,
  };
}

export type MappedOrder = {|
  txId: string,
  utxo?: string,
  sender?: string,
  provider?: string,
  price: string,
  amount: string,
  totalValues: ?Array<FormattedTokenValue>,
  from: any,
  to: any,
|};

export function useRichOrders(
  defaultTokenInfo: RemoteTokenInfo,
  fetchTransactionTimestamps: (Array<string>) => Promise<{ [string]: Date }>,
): {|
  openOrders: Array<MappedOrder>,
  completedOrders: Array<MappedOrder>,
  transactionTimestamps: { [string]: Date },
|} {
  const {order, tokens, stakingKey} = useSwap()

  /**
   * Fetch verified tokens list converted to map
   */
  const { data: tokensMap } = useQuery({
    suspense: true,
    queryKey: ['useSwapTokensOnlyVerified'],
    queryFn: () => tokens.list.onlyVerified()
      .then(tokensArray => tokensArray.reduce((map, t) => ({ ...map, [t.id]: t }), {}))
      .catch(e => {
        console.error('Failed to load verified tokens!', e);
        throw e;
      }),
  });

  /**
   * Fetch open orders
   */
  const { data: openOrdersData } = useQuery({
    queryKey: ['useSwapOrdersByStatusOpen', stakingKey],
    queryFn: () => order.list.byStatusOpen().catch(e => {
      console.error('Failed to load open orders!', e);
      throw e;
    }),
  });

  /**
   * Fetch completed orders
   */
  const { data: completedOrdersData } = useQuery({
    queryKey: ['useSwapOrdersByStatusCompleted', stakingKey],
    queryFn: () => order.list.byStatusCompleted().catch(e => {
      console.error('Failed to load completed orders!', e);
      throw e;
    }),
  });

  const [openOrders, setOpenOrders] = useState<Array<MappedOrder>>([]);
  const [completedOrders, setCompletedOrders] = useState<Array<MappedOrder>>([]);
  const [transactionTimestamps, setTransactionTimestamps] = useState<{ [string]: Date }>({});

  /**
   * Map open orders with verified tokens when both are fetched
   */
  useEffect(() => {
    if (tokensMap && openOrdersData) {
      setOpenOrders(
        openOrdersData.map(o => {
          const txId = (o.utxo.split('#')[0]);
          const from = { quantity: o.from.quantity, token: tokensMap[o.from.tokenId] };
          const to = { quantity: o.to.quantity, token: tokensMap[o.to.tokenId] };
          return {
            txId: txId.toLowerCase(),
            utxo: o.utxo,
            batcherFee: o.batcherFee,
            deposit: o.deposit,
            provider: o.provider,
            sender: o.sender,
            ...mapOrderAssets(from, to, o.valueAttached, defaultTokenInfo),
          };
        })
      );
    }
  }, [tokensMap, openOrdersData]);

  /**
   * Map completed orders with verified tokens when both are fetched
   */
  useEffect(() => {
    if (tokensMap && completedOrdersData) {
      setCompletedOrders(
        completedOrdersData.map(o => {
          const from = { quantity: o.from.quantity, token: tokensMap[o.from.tokenId] };
          const to = { quantity: o.to.quantity, token: tokensMap[o.to.tokenId] };
          return {
            txId: o.txHash.toLowerCase(),
            ...mapOrderAssets(from, to, null, defaultTokenInfo),
          };
        })
      );
    }
  }, [tokensMap, completedOrdersData]);

  /**
   * Fetch missing transaction timestamps any time open or completed orders change
   */
  useEffect(() => {
    const txHashes = [...openOrders, ...completedOrders].map(o => o.txId);
    const existingSet = new Set(Object.keys(transactionTimestamps));
    const filteredTxHashes = txHashes.filter(x => !existingSet.has(x));
    if (filteredTxHashes.length === 0) return;
    fetchTransactionTimestamps(filteredTxHashes).then(newTimestamps => {
      setTransactionTimestamps(state => ({ ...state, ...newTimestamps }));
      return null;
    }).catch(e => console.error('Failed to load transaction timestamps!', e));
  }, [openOrders, completedOrders]);

  return { openOrders, completedOrders, transactionTimestamps };
}
