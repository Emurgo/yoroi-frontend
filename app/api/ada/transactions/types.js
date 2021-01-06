// @flow

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

import type {
  Address, Value, Addressing,
} from '../lib/storage/models/PublicDeriver/interfaces';
import {
  MultiToken,
} from '../../common/lib/MultiToken';

import type { RemoteUnspentOutput } from '../lib/state-fetch/types';

export const transactionTypes = Object.freeze({
  EXPEND: 'expend',
  INCOME: 'income',
  EXCHANGE: 'exchange',
  SELF: 'self',
  MULTI: 'multi',
});
export type TransactionDirectionType = $Values<typeof transactionTypes>;

export type AddressKeyMap = { [addr: string]: RustModule.WalletV2.PrivateKey, ... };

export type UserAnnotation = {|
  +type: TransactionDirectionType,
  +amount: MultiToken,
  +fee: MultiToken,
|};

export type CardanoAddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
|};

export type BaseSignRequest<T> = {|
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx: T,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  certificate: void | RustModule.WalletV3.Certificate,
|};

export type V3UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  IOs: RustModule.WalletV3.InputOutput,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type V3UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<CardanoAddressedUtxo>,
  IOs: RustModule.WalletV3.InputOutput,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  certificate: void | RustModule.WalletV3.Certificate,
|};
export type V4UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type V4UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<CardanoAddressedUtxo>,
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
|};
