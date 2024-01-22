// @flow

import type { NetworkRow } from '../ada/lib/storage/database/primitives/tables';
import { isCardanoHaskell } from '../ada/lib/storage/database/prepackaged/networks';

// <TODO:PENDING_REMOVAL> LEGACY
export const ApiOptions = Object.freeze({
  ada: 'ada',
});

// <TODO:PENDING_REMOVAL> LEGACY
export type ApiOptionType = $Values<typeof ApiOptions>;

// <TODO:PENDING_REMOVAL> LEGACY
export const getApiForNetwork: $ReadOnly<NetworkRow> => ApiOptionType = (type) => {
  if (isCardanoHaskell(type)) {
    return ApiOptions.ada;
  }
  throw new Error(`${nameof(getApiForNetwork)} missing entry for type ${JSON.stringify(type)}`);
};
