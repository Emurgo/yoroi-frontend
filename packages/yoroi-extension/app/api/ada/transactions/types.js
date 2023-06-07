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

export type CardanoUtxoScriptWitness = {|
  nativeScript: string,
|} | {|
  plutusScript: string,
  datum: string,
  redeemer: string,
|}

export type CardanoAddressedUtxo = {|
  ...RemoteUnspentOutput,
  ...Addressing,
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

export type Cip36Data = {|
  delegations: Array<{| voteKey: string, weight: number |}>,
  stakingKeyPath: Array<number>,
  votePaymentKeyPath: Array<number>,
  nonce: number,
  purpose: number,
  ownVoteKey: string,
  ownVoteKeyPath: Array<number>,
|};
