// @flow

// https://github.com/trezor/connect/issues/350
import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { $Path } from 'trezor-connect/lib/types/params';

// replace with real types once this PR is merged
// https://github.com/trezor/connect/pull/404
export type CardanoInput = {
  path: $Path,
  prev_hash: string,
  prev_index: number,
  type: number,
}
export type CardanoOutput = {
  path: $Path,
  amount: string,
} | {
  address: string,
  amount: string,
}

export type LedgerSignTxPayload = {
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
}
