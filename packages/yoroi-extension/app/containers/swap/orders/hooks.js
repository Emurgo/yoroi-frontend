//@flow
import { useSwap, } from '@yoroi/swap';
import { useQuery } from 'react-query';
import { useEffect, useState } from 'react';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { Quantities } from '../../../utils/quantities';
import { PRICE_PRECISION } from '../../../components/swap/common';
import { maybe } from '../../../coreUtils';
import type { FormattedTokenValue } from './util';
import { createFormattedTokenValues } from './util';

function mapOrderAssets(
  order: any,
  defaultTokenInfo: RemoteTokenInfo
): {|
  price: string,
  amount: string,
  totalValues: ?Array<FormattedTokenValue>,
  from: any,
  to: any,
|} {
  const price = Quantities.quotient(order.from.quantity, order.to.quantity);
  const fromDecimals = order.from.token?.decimals ?? 0;
  const toDecimals = order.to.token?.decimals ?? 0;
  const priceDenomination = fromDecimals - toDecimals;
  const formattedPrice = Quantities.format(price, priceDenomination, PRICE_PRECISION);
  const formattedToQuantity = Quantities.format(
    order.to.quantity,
    toDecimals,
    toDecimals
  );
  const formattedAttachedValues = maybe(order.valueAttached, val =>
    createFormattedTokenValues({
      entries: val.map(({
        token: id,
        amount
      }) => ({
        id,
        amount
      })),
      order,
      defaultTokenInfo,
    })
  );
  return {
    price: formattedPrice,
    amount: formattedToQuantity,
    totalValues: formattedAttachedValues,
    from: order.from,
    to: order.to,
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

function mapOpenOrder(order: any, defaultTokenInfo: RemoteTokenInfo): MappedOrder {
  const txId = order.utxo.split('#')[0];
  return {
    txId,
    utxo: order.utxo,
    sender: order.sender,
    provider: order.provider,
    ...mapOrderAssets(order, defaultTokenInfo),
  };
}

function mapCompletedOrder(order: any, defaultTokenInfo: RemoteTokenInfo): MappedOrder {
  return {
    txId: order.txHash,
    ...mapOrderAssets(order, defaultTokenInfo),
  };
}

export function useRichOrders(
  defaultTokenInfo: RemoteTokenInfo
): {| openOrders: Array<MappedOrder>, completedOrders: Array<MappedOrder> |} {
  const {order, tokens, stakingKey} = useSwap()

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

  const { data: openOrdersData } = useQuery({
    suspense: true,
    queryKey: ['useSwapOrdersByStatusOpen', stakingKey],
    queryFn: () => order.list.byStatusOpen().catch(e => {
      console.error('Failed to load open orders!', e);
      throw e;
    }),
  });

  const { data: completedOrdersData } = useQuery({
    suspense: true,
    queryKey: ['useSwapOrdersByStatusCompleted', stakingKey],
    queryFn: () => order.list.byStatusCompleted().catch(e => {
      console.error('Failed to load completed orders!', e);
      throw e;
    }),
  });

  const [openOrders, setOpenOrders] = useState<Array<MappedOrder>>([]);
  const [completedOrders, setCompletedOrders] = useState<Array<MappedOrder>>([]);

  useEffect(() => {
    if (tokensMap && openOrdersData) {
      setOpenOrders(
        openOrdersData.map(o => {
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
        }).map(o => mapOpenOrder(o, defaultTokenInfo))
      );
    }
  }, [tokensMap, openOrdersData]);

  useEffect(() => {
    if (tokensMap && completedOrdersData) {
      setCompletedOrders(
        completedOrdersData.map(o => {
          const fromToken = tokensMap[o.from.tokenId];
          const toToken = tokensMap[o.to.tokenId];
          return {
            txHash: o.txHash,
            from: { quantity: o.from.quantity, token: fromToken },
            to: { quantity: o.to.quantity, token: toToken },
          };
        }).map(o => mapCompletedOrder(o, defaultTokenInfo))
      );
    }
  }, [tokensMap, completedOrdersData])

  return { openOrders, completedOrders };
}
