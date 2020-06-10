// @flow

import type {
  Address, Addressing, UsedStatus, Value,
} from '../api/ada/lib/storage/models/PublicDeriver/interfaces';

export type StandardAddress = {|
  ...Address,
  ...InexactSubset<Value>,
  ...InexactSubset<Addressing>,
  ...InexactSubset<UsedStatus>,
|};

export const AddressStoreTypes = Object.freeze({
  all: 'all',
  internal: 'internal',
  external: 'external',
  mangled: 'mangled',
});
export type AddressStoreKind = $Values<typeof AddressStoreTypes>;

export const AddressFilter = Object.freeze({
  None: 0,
  Unused: 1,
  Used: 2,
  HasBalance: 3,
});
export type AddressFilterKind = $Values<typeof AddressFilter>;
