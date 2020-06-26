// @flow

import { CoinTypes } from '../../config/numbersConfig';
import { getAdaCurrencyMeta } from '../ada/currencyInfo';
import { getErgoCurrencyMeta } from '../ergo/currencyInfo';
import type { NetworkRow } from '../ada/lib/storage/database/primitives/tables';

export const ApiOptions = Object.freeze({
  ada: 'ada',
  ergo: 'ergo',
});
export type ApiOptionType = $Values<typeof ApiOptions>;

export const getApiForNetwork: $ReadOnly<NetworkRow> => ApiOptionType = (type) => {
  if (type.CoinType === CoinTypes.CARDANO) {
    return ApiOptions.ada;
  }
  if (type.CoinType === CoinTypes.ERGO) {
    return ApiOptions.ergo;
  }
  throw new Error(`${nameof(getApiForNetwork)} missing entry for type ${JSON.stringify(type)}`);
};

export type SelectedApiType = {|
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
