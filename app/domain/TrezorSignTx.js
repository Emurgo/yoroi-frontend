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
  protocol_magic: 764824073 | 1097911063 // 764824073 = Mainnet | 1097911063 = Testnet
}
