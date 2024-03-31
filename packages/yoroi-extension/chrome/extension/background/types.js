// @flow

export type WalletState = {|
  publicDeriverId: number,
  utxos: Array<any>, // fixme
  transactions: Array<any>
|};
