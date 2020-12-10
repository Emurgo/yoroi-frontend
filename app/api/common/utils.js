// @flow

import type { NetworkRow } from '../ada/lib/storage/database/primitives/tables';
import { isErgo, isCardanoHaskell, isJormungandr } from '../ada/lib/storage/database/prepackaged/networks';

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
  if (isErgo(type)) {
    return ApiOptions.ergo;
  }
  throw new Error(`${nameof(getApiForNetwork)} missing entry for type ${JSON.stringify(type)}`);
};
