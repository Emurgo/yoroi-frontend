// @flow

import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';

// checkAddressesInUse

export type FilterUsedRequest = {|
  network: $ReadOnly<NetworkRow>,
  addresses: Array<string>,
|};
export type FilterUsedResponse = Array<string>;
export type FilterFunc = (body: FilterUsedRequest) => Promise<FilterUsedResponse>;
