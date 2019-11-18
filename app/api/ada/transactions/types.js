// @flow

import {
  BigNumber
} from 'bignumber.js';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';

import type {
  DbTxIO,
} from '../lib/storage/database/transactionModels/multipart/tables';
import type { DbBlock, } from '../lib/storage/database/primitives/tables';
import type {
  Address, Value, Addressing,
} from '../lib/storage/models/PublicDeriver/interfaces';

import type { RemoteUnspentOutput } from '../lib/state-fetch/types';

export const transactionTypes = Object.freeze({
  EXPEND: 'expend',
  INCOME: 'income',
  EXCHANGE: 'exchange',
  SELF: 'self',
  MULTI: 'multi',
});
export type TransactionDirectionType = $Values<typeof transactionTypes>;

export type UserAnnotation = {|
  +type: TransactionDirectionType,
  +amount: BigNumber,
  +fee: BigNumber,
|};

export type UtxoAnnotatedTransaction = {|
  ...DbTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|};

export type AddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
|};

export type UnsignedTxFromUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  txBuilder: RustModule.WalletV2.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type UnsignedTxResponse = {|
  senderUtxos: Array<AddressedUtxo>,
  txBuilder: RustModule.WalletV2.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type BaseSignRequest = {|
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: RustModule.WalletV2.Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};

export type V3UnsignedTxUtxoResponse = {|
  senderUtxos: Array<RemoteUnspentOutput>,
  unsignedTx: RustModule.WalletV3.Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type V3UnsignedTxAddressedUtxoResponse = {|
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: RustModule.WalletV3.Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
