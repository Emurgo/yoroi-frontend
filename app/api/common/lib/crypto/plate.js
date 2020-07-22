// @flow

import type { WalletChecksum } from '@emurgo/cip4-js';

export type PlateResponse = {|
  addresses: Array<string>,
  accountPlate: WalletChecksum
|};
