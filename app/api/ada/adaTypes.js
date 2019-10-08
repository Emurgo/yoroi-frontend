// @flow

import {
  BigNumber
} from 'bignumber.js';
import { RustModule } from './lib/cardanoCrypto/rustLoader';

import type {
  DbTxIO
} from './lib/storage/database/transactions/tables';
import type { DbBlock, } from './lib/storage/database/uncategorized/tables';
import type {
  Address, Value, Addressing,
} from './lib/storage/models/common/interfaces';

/*
 * This file gives the flow equivalents of the the Haskell types given in the wallet API at
 * https://github.com/input-output-hk/cardano-sl/blob/master/wallet/src/Pos/Wallet/Web/ClientTypes/Types.hs
 * TODO: https://github.com/Emurgo/yoroi-frontend/issues/116
*/

// ========= Response Types =========

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
  txBuilder: RustModule.Wallet.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type UnsignedTxResponse = {|
  senderUtxos: Array<AddressedUtxo>,
  txBuilder: RustModule.Wallet.TransactionBuilder,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
|};
export type BaseSignRequest = {|
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: RustModule.Wallet.Transaction,
|};

/* Backend service Postgres data types */

export type RemoteTxState = 'Successful' | 'Failed' | 'Pending';

export type RemotoeTransactionInput = {|
  +address: string,
  +amount: string,
  +id: string, // concatenation of txHash || index
  +index: number,
  +txHash: string,
|}
export type RemoteTransactionOutput = {|
  +address: string,
  +amount: string,
|};

/**
 * only present if TX is in a block
 */
export type RemoteTxBlockMeta = {|
  +height: number,
  +block_hash: string,
  +tx_ordinal: number,
  +time: string, // timestamp with timezone
  +epoch: number,
  +slot: number,
|};
export type RemoteTxInfo = {|
  +hash: string,
  +last_update: string, // timestamp with timezone
  +tx_state: RemoteTxState,
  +inputs: Array<RemotoeTransactionInput>,
  +outputs: Array<RemoteTransactionOutput>,
|};
export type RemoteTransaction = {|
  ...WithNullableFields<RemoteTxBlockMeta>,
  ...RemoteTxInfo,
|};

export type RemoteUnspentOutput = {|
  +utxo_id: string, // concat tx_hash and tx_index
  +tx_hash: string,
  +tx_index: number,
  +receiver: string,
  +amount: string
|};
