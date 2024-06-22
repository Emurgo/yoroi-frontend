// @flow
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { Quantities } from '../../../utils/quantities';
import { forceNonNull, maybe } from '../../../coreUtils';

export type FormattedTokenValue = {|
  value: string,
  formattedValue: string,
  ticker: string,
|};

export function createFormattedTokenValues({
  entries,
  order,
  defaultTokenInfo,
}: {|
  entries: Array<{| id: string, amount: string |}>,
  order: any,
  defaultTokenInfo: RemoteTokenInfo,
|}): Array<FormattedTokenValue> {
  const tokenAmountMap = entries.reduce(
    (map, v) => ({
      ...map,
      [v.id]: Quantities.sum([map[v.id] ?? '0', v.amount])
    }),
    {}
  );
  const ptDecimals = forceNonNull(defaultTokenInfo.decimals);
  // $FlowIgnore[prop-missing]
  const defaultTokenValue = tokenAmountMap[''] ?? tokenAmountMap['.'] ?? '0';
  const formattedTokenValues = [
    {
      value: defaultTokenValue,
      formattedValue: Quantities.format(defaultTokenValue, ptDecimals, ptDecimals),
      ticker: defaultTokenInfo.ticker ?? '-',
    },
  ];
  [order.from.token, order.to.token].forEach(t => {
    if (t.id !== '' && t.id !== '.') {
      maybe(tokenAmountMap[t.id], v => {
        const formattedValue = Quantities.format(v, t.decimals, t.decimals);
        formattedTokenValues.push({
          value: v,
          formattedValue,
          ticker: t.ticker ?? '-',
        });
      });
    }
  });
  return formattedTokenValues;
}