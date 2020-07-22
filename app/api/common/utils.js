// @flow

import { CoinTypes } from '../../config/numbersConfig';
import { getAdaCurrencyMeta } from '../ada/currencyInfo';
import { getErgoCurrencyMeta } from '../ergo/currencyInfo';
import { getJormungandrCurrencyMeta } from '../jormungandr/currencyInfo';
import type { NetworkRow } from '../ada/lib/storage/database/primitives/tables';
import { isCardanoHaskell, isJormungandr } from '../ada/lib/storage/database/prepackaged/networks';

export const ApiOptions = Object.freeze({
  ada: 'ada',
  jormungandr: 'jormungandr',
  ergo: 'ergo',
});
export type ApiOptionType = $Values<typeof ApiOptions>;

export const getApiForNetwork: $ReadOnly<NetworkRow> => ApiOptionType = (type) => {
  if (isCardanoHaskell(type)) {
    return ApiOptions.ada;
  }
  if (isJormungandr(type)) {
    return ApiOptions.jormungandr;
  }
  if (type.CoinType === CoinTypes.ERGO) {
    return ApiOptions.ergo;
  }
  throw new Error(`${nameof(getApiForNetwork)} missing entry for type ${JSON.stringify(type)}`);
};

export type SelectedApiType = {|
  type: 'jormungandr',
  meta: ReturnType<typeof getJormungandrCurrencyMeta>,
|} | {|
  type: 'ada',
  meta: ReturnType<typeof getAdaCurrencyMeta>,
|} | {|
  type: 'ergo',
  meta: ReturnType<typeof getErgoCurrencyMeta>,
|};

export function getApiMeta(
  api: void | ApiOptionType
): void | SelectedApiType {
  switch (api) {
    case undefined: {
      return undefined;
    }
    case ApiOptions.ada: {
      return {
        type: 'ada',
        meta: getAdaCurrencyMeta(),
      };
    }
    case ApiOptions.jormungandr: {
      return {
        type: 'jormungandr',
        meta: getJormungandrCurrencyMeta(),
      };
    }
    case ApiOptions.ergo: {
      return {
        type: 'ergo',
        meta: getErgoCurrencyMeta(),
      };
    }
    default:
      throw new Error(`${nameof(getApiMeta)} no result for ${api}`);
  }
}
