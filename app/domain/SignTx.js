// @flow

// TODO: if possilbe for Trezor and Ledger import flow definition from their module

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

export type BIP32Path = Array<number>;

export type LedgerInputTypeUTxO = {
  txDataHex: string,
  outputIndex: number,
  path: BIP32Path
};

export type LedgerOutputTypeAddress = {
  amountStr: string,
  address58: string
};

export type LedgerOutputTypeChange = {
  amountStr: string,
  path: BIP32Path
};

export type LedgerSignTxPayload = {
  inputs: Array<InputTypeUTxO>,
  outputs: Array<LedgerOutputTypeAddress | LedgerOutputTypeChange>,
}
