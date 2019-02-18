// @flow

// https://github.com/trezor/connect/issues/350
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

export type BIP32Path = Array<number>;

export type InputTypeUTxO = {|
  txDataHex: string,
  outputIndex: number,
  path: BIP32Path
|};

export type OutputTypeAddress = {|
  amountStr: string,
  address58: string
|};

export type OutputTypeChange = {|
  amountStr: string,
  path: BIP32Path
|};

export type LedgerSignTxPayload = {
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
}
