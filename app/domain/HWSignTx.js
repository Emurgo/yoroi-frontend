// @flow

import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

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

export type LedgerUnsignedUtxo = {
  txHash: string,
  address: string,
  coins: number,
  outputIndex: number
};
export type LedgerUnsignedInput = {
  coins: number,
  txHash: string,
  outputIndex: number,
  utxo: LedgerUnsignedUtxo
}
export type LedgerUnsignedOutput = {
  address: string,
  coins: number,
  isChange: boolean
}
