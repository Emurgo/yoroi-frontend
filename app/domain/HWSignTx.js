// @flow

import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

export type LedgerSignTxPayload = {|
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
|};
