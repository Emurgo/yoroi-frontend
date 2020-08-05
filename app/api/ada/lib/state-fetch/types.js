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
  +ttl?: string,
  +fee: string,
  +certificates: $ReadOnlyArray<RemoteCertificate>,
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
  +byron: void | 'byron',
  +shelley: 'shelley',
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
  // these will be ordered by the input transaction id asc
  +inputs: Array<RemoteTransactionInput>,
  // these will be ordered by transaction index asc.
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
  +address: string, // hex
  +amount: string,
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
  +stakeCredential: string, // hex
|};
export type RemoteStakeDeregistrationCert = {|
  +stakeCredential: string, // hex
|};
export type RemoteStakeDelegationCert = {|
  +stakeCredential: string, // hex
  +poolKeyHash: string, // hex
|};
export type RemotePoolRegistrationCert = {|
  +pool_params: {|
    +operator: string,
    +vrfKeyHash: string,
    +pledge: number | string, // TODO: should be string
    +cost: string,
    +margin: number,
    // +margin: {|
    //   +numerator: string,
    //   +denominator: string
    // |},
    +rewardAccount: string, // hex
    +poolOwners: Array<string>, // hex
    // TODO: some relay fields are optional I think. Need to investigate
    +relays: Array<{|
      ipv4: string,
      ipv6: string,
      dnsName: string,
      dnsSrvName: string,
      port: string,
    |}>,
    +poolMetadata: null | {|
      +url: string,
      +metadataHash: string, // hex
    |},
  |},
|};
export type RemotePoolRetirementCert = {|
  +poolKeyHash: string, // hex
  +epoch: number,
|};
export type RemoteGenesisKeyDelegationCert = {|
  +genesishash: string,
  +genesisDelegateHash: string,
  +vrfKeyHash: string,
|};
export type RemoteMoveInstantaneousRewardsCert = {|
  +pot: number | ('Reserve' | 'Treasury'),
  +rewards: Array<string>, // stakeCredential hex
  // +rewards: {| [stake_credential: string]: string /* coin */ |},
|};
export type RemoteCertificate = {|
  cert_index: number,
  ...({|
    +type: typeof ShelleyCertificateTypes.StakeRegistration,
    ...RemoteStakeRegistrationCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.StakeDeregistration,
    ...RemoteStakeDeregistrationCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.StakeDelegation,
    ...RemoteStakeDelegationCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.PoolRegistration,
    ...RemotePoolRegistrationCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.PoolRetirement,
    ...RemotePoolRetirementCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.GenesisKeyDelegation,
    ...RemoteGenesisKeyDelegationCert,
  |} | {|
    +type: typeof ShelleyCertificateTypes.MoveInstantaneousRewardsCert,
    ...RemoteMoveInstantaneousRewardsCert,
  |})
|};

// getAccountState

export type AccountStateRequest = {|
  addresses: Array<string>
|};
export type RemoteAccountState = {|
  value: string,
|};
export type AccountStateResponse = {|
  [key: string]: RemoteAccountState,
|};
export type AccountStateFunc = (body: AccountStateRequest) => Promise<AccountStateResponse>;

// getRewardHistory

export type RewardHistoryRequest = {|
  addresses: Array<string>,
|};
export type RewardTuple = [
  number, /* epoch */
  number /* amount in lovelaces */
];
export type RewardHistoryResponse = { [address: string]: Array<RewardTuple>, ... };
export type RewardHistoryFunc = (body: RewardHistoryRequest) => Promise<RewardHistoryResponse>;

export type PoolInfoRequest = {|
  ids: Array<string>
|};
export type RemotePoolInfo = {|
  +owner: string, // bech32
  +pledge_address: string, // bech32

  // from pool metadata (off chain)
  +name?: string,
  +description?: string,
  +ticker?: string,
  +homepage?: string,
|};
export type RemotePool = {|
  +info: RemotePoolInfo,
  +history: Array<{|
    +epoch: number,
    +slot: number,
    +tx_ordinal: number,
    +cert_ordinal: number,
    +payload: any, // TODO: how to store this since different networks have different cert types
  |}>,
|};
export type PoolInfoResponse = {|
  [key: string]: (RemotePool | null),
|};
export type PoolInfoFunc = (body: PoolInfoRequest) => Promise<PoolInfoResponse>;
