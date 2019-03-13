// @flow

// https://github.com/trezor/connect/issues/350
import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

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
  transactions: Array<string>,
  protocol_magic: number // 764824073 = mainnet | 1097911063 = testnet (not yet supported)
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
