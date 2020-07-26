// @flow

import typeof { MIRPot } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';

// getUTXOsForAddresses

export type AddressUtxoRequest = {| addresses: Array<string>, |};
export type AddressUtxoResponse = Array<RemoteUnspentOutput>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

// getTxsBodiesForUTXOs

export type TxBodiesRequest = {| txsHashes: Array<string>, |};
export type TxBodiesResponse = { [key: string]:string, ... };
export type TxBodiesFunc = (body: TxBodiesRequest) => Promise<TxBodiesResponse>;

// getUTXOsSumsForAddresses

export type UtxoSumRequest = {| addresses: Array<string>, |};
export type UtxoSumResponse = {| sum: ?string, |};
export type UtxoSumFunc = (body: UtxoSumRequest) => Promise<UtxoSumResponse>;

// getTransactionsHistoryForAddresses

export type HistoryRequest = {|
  addresses: Array<string>,
  after?: {|
    block: string,
    tx: string,
  |},
  untilBlock: string,
|};
export type HistoryResponse = Array<RemoteTransaction>;
export type HistoryFunc = (body: HistoryRequest) => Promise<HistoryResponse>;

// getBestBlock

export type BestBlockRequest = void;
export type BestBlockResponse = {|
  // 0 if no blocks in db
  height: number,
  // null when no blocks in db
  epoch: null | number,
  slot: null | number,
  hash: null | string,
|};
export type BestBlockFunc = (body: BestBlockRequest) => Promise<BestBlockResponse>;

// sendTx

export type SignedRequestInternal = {|
  signedTx: string,
|};
export type SignedRequest = {|
  id: string,
  encodedTx: Uint8Array,
|};
export type SignedResponse = {| txId: string, |};
export type SendFunc = (body: SignedRequest) => Promise<SignedResponse>;

/* Backend service data types */

export type RemoteTxState = 'Successful' | 'Failed' | 'Pending';

export type RemoteTransactionShelley = {|
  +ttl: string,
  +fee: string,
  +certificates: Array<RemoteCertificate>,
  +withdrawals: Array<RemoteWithdrawal>,
  +metadata: null | string,
|};
export type RemoteTransactionBase = {|
  ...WithNullableFields<RemoteTxBlockMeta>,
  +hash: string,
  +last_update: string, // timestamp with timezone
  +tx_state: RemoteTxState,
  +inputs: Array<RemoteTransactionInput>,
  +outputs: Array<RemoteTransactionOutput>,
|};
type RemoteTransactionTypeT = {|
  byron: void | 'byron',
  shelley: 'shelley',
|};
export const RemoteTransactionTypes: RemoteTransactionTypeT = Object.freeze({
  byron: 'byron',
  shelley: 'shelley',
});
export type RemoteTransactionInput = {|
  +id: string,
  +index: number,
  +txHash: string,
  +address: string,
  +amount: string,
|};
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
  +inputs: Array<RemoteTransactionInput>,
  +outputs: Array<RemoteTransactionOutput>,
|};
export type RemoteTransaction = {|
  +type?: $PropertyType<RemoteTransactionTypeT, 'byron'>,
  ...RemoteTransactionBase,
|} | {|
  +type: $PropertyType<RemoteTransactionTypeT, 'shelley'>,
  ...RemoteTransactionBase,
  ...RemoteTransactionShelley,
|};

export type RemoteUnspentOutput = {|
  +utxo_id: string, // concat tx_hash and tx_index
  +tx_hash: string,
  +tx_index: number,
  +receiver: string,
  +amount: string
|};

export type RemoteWithdrawal = {|
  address: string,
  amount: string,
|};

export const ShelleyCertificateTypes = Object.freeze({
  StakeRegistration: 'StakeRegistration',
  StakeDeregistration: 'StakeDeregistration',
  StakeDelegation: 'StakeDelegation',
  PoolRegistration: 'PoolRegistration',
  PoolRetirement: 'PoolRetirement',
  GenesisKeyDelegation: 'GenesisKeyDelegation',
  MoveInstantaneousRewardsCert: 'MoveInstantaneousRewardsCert',
});

export type RemoteStakeRegistrationCert = {|
  stake_credential: string,
|};
export type RemoteStakeDeregistrationCert = {|
  stake_credential: string,
|};
export type RemoteStakeDelegationCert = {|
  stake_credential: string,
  pool_keyhash: string,
|};
export type RemotePoolRegistrationCert = {|
  pool_params: {|
    operator: string,
    vrf_keyhash: string,
    pledge: string,
    cost: string,
    margin: {|
      numerator: string,
      denominator: string
    |},
    reward_account: string,
    pool_owners: Array<string>,
    relays: Array<string>,
    pool_metadata: void | {|
      url: string,
      metadata_hash: string,
    |},
  |},
|};
export type RemotePoolRetirementCert = {|
  pool_keyhash: string,
  epoch: number,
|};
export type RemoteGenesisKeyDelegationCert = {|
  genesishash: string,
  genesis_delegate_hash: string,
  vrf_keyhash: string,
|};
export type RemoteMoveInstantaneousRewardsCert = {|
  pot: $Values<MIRPot>,
  rewards: {| [stake_credential: string]: string /* coin */ |},
|};
export type RemoteCertificate = {|
  type: typeof ShelleyCertificateTypes.StakeRegistration,
  ...RemoteStakeRegistrationCert,
|} | {|
  type: typeof ShelleyCertificateTypes.StakeDeregistration,
  ...RemoteStakeDeregistrationCert,
|} | {|
  type: typeof ShelleyCertificateTypes.StakeDelegation,
  ...RemoteStakeDelegationCert,
|} | {|
  type: typeof ShelleyCertificateTypes.PoolRegistration,
  ...RemotePoolRegistrationCert,
|} | {|
  type: typeof ShelleyCertificateTypes.PoolRetirement,
  ...RemotePoolRetirementCert,
|} | {|
  type: typeof ShelleyCertificateTypes.GenesisKeyDelegation,
  ...RemoteGenesisKeyDelegationCert,
|} | {|
  type: typeof ShelleyCertificateTypes.MoveInstantaneousRewardsCert,
  ...RemoteMoveInstantaneousRewardsCert,
|};
