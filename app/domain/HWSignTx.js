// @flow

import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
} from 'yoroi-extension-ledger-bridge';

// TODO [TREZOR] : if possilbe for Trezor and Ledger import flow definition from their module

export type TrezorInput = {
  path: string,
  prev_hash: string,
  prev_index: number, // I’m not sure what it is. cuOutIndex
  type: number // refers to script type
}

export type TrezorOutput = {
  address?: string,
  path?: string,
  amount: string,
}

export type TrezorSignTxPayload = {
  inputs: Array<TrezorInput>,
  outputs: Array<TrezorOutput>,
  transactions: Array<any>,
  network: 1 | 2 // 1 = Testnet | 2 = Mainnet
}

export type LedgerSignTxPayload = {
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
}
