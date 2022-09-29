// @flow

import typeof { MIRPot } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import type { BackendNetworkInfo } from '../../../common/lib/state-fetch/types';

// getUTXOsForAddresses

export type AddressUtxoRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type AddressUtxoResponse = Array<RemoteUnspentOutput>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

// getTxsBodiesForUTXOs

export type TxBodiesRequest = {|
  ...BackendNetworkInfo,
  txsHashes: Array<string>,
|};
export type TxBodiesResponse = { [key: string]:string, ... };
export type TxBodiesFunc = (body: TxBodiesRequest) => Promise<TxBodiesResponse>;

// getUTXOsSumsForAddresses

export type UtxoSumRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type UtxoSumResponse = {|
  +sum: ?string,
  +assets: $ReadOnlyArray<$ReadOnly<{
    +amount: string,
    +assetId: string,
    +policyId: string,
    +name: string,
    ...
  }>>,
|};
export type UtxoSumFunc = (body: UtxoSumRequest) => Promise<UtxoSumResponse>;

// getTransactionsHistoryForAddresses

export type HistoryRequest = {|
  ...BackendNetworkInfo,
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

export type BestBlockRequest = {|
  ...BackendNetworkInfo,
|};
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
  ...BackendNetworkInfo,
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
  // The updated backend will always return this field, but we allow it to be
  // missing which is treated as `true` for backward compatiblity.
  // This way we don't have to update the frontend and backend in lockstep.
  // When the backend update is deployed, we can change this field to mandatory
  // for strictness.
  +valid_transaction?: boolean,
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
  +index: number, // index of output we're consuming
  +txHash: string, // tx that created output we're consuming
  +address: string,
  +amount: string,
  +assets: $ReadOnlyArray<$ReadOnly<{
    +amount: string,
    +assetId: string,
    +policyId: string,
    +name: string,
    ...
  }>>,
|};
export type RemoteTransactionOutput = {|
  +address: string,
  +amount: string,
  +assets: $ReadOnlyArray<$ReadOnly<{
    +amount: string,
    +assetId: string,
    +policyId: string,
    +name: string,
    ...
  }>>,
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
  +amount: string,
  +assets: $ReadOnlyArray<$ReadOnly<{
    +amount: string,
    +assetId: string,
    +policyId: string,
    +name: string,
    ...
  }>>,
  // +block_num: number,
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
  +rewardAddress: string, // hex
|};
export type RemoteStakeDeregistrationCert = {|
  +rewardAddress: string, // hex
|};
export type RemoteStakeDelegationCert = {|
  +rewardAddress: string, // hex
  +poolKeyHash: string, // hex
|};
export type RemotePoolRegistrationCert = {|
  +poolParams: {|
    +operator: string,
    +vrfKeyHash: string,
    +pledge: string,
    +cost: string,
    +margin: number,
    // +margin: {|
    //   +numerator: string,
    //   +denominator: string
    // |},
    +rewardAccount: string, // hex
    +poolOwners: Array<string>, // hex
    +relays: Array<{|
      ipv4: string | null,
      ipv6: string | null,
      dnsName: string | null,
      dnsSrvName: string | null,
      port: string | null,
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
  +pot: $Values<MIRPot>,
  +rewards: {| [stake_credential: string]: string /* coin */ |},
|};
export type RemoteCertificate = {|
  certIndex: number,
  ...({|
    +kind: typeof ShelleyCertificateTypes.StakeRegistration,
    ...RemoteStakeRegistrationCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.StakeDeregistration,
    ...RemoteStakeDeregistrationCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.StakeDelegation,
    ...RemoteStakeDelegationCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.PoolRegistration,
    ...RemotePoolRegistrationCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.PoolRetirement,
    ...RemotePoolRetirementCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.GenesisKeyDelegation,
    ...RemoteGenesisKeyDelegationCert,
  |} | {|
    +kind: typeof ShelleyCertificateTypes.MoveInstantaneousRewardsCert,
    ...RemoteMoveInstantaneousRewardsCert,
  |})
|};

// getAccountState

export type AccountStateRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>
|};
export type RemoteAccountState = {|
  poolOperator: null, // not implemented yet
  remainingAmount: string, // current remaining awards
  rewards: string, // all the rewards every added
  withdrawals: string, // all the withdrawals that have ever happened
|};
export type AccountStateResponse = {|
  [key: string]: null | RemoteAccountState,
|};
export type AccountStateFunc = (body: AccountStateRequest) => Promise<AccountStateResponse>;

// getRewardHistory

export type RewardHistoryRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type RewardTuple = {|
  epoch: number,
  reward: string,
  poolHash: string,
|};
export type RewardHistoryResponse = { [address: string]: ?Array<RewardTuple>, ... };
export type RewardHistoryFunc = (body: RewardHistoryRequest) => Promise<RewardHistoryResponse>;

export type PoolInfoRequest = {|
  ...BackendNetworkInfo,
  poolIds: Array<string>
|};
export type TokenInfoRequest = {|
  ...BackendNetworkInfo,
  tokenIds: Array<string>
|};
export type RemotePoolInfo = {|
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

export type RemoteTokenInfo = {|
  // from token metadata (off chain)
  +name?: string,
  +decimals?: number,
  +ticker?: string,
|};
export type TokenInfoResponse = {|
  [key: string]: (RemoteTokenInfo | null),
|};
export type PoolInfoFunc = (body: PoolInfoRequest) => Promise<PoolInfoResponse>;
export type TokenInfoFunc = (body: TokenInfoRequest) => Promise<TokenInfoResponse>;

export type CatalystRoundInfoRequest = {|
  ...BackendNetworkInfo
  |};

export type CatalystRound = {|
  +id: number,
  +name: string,
  +registrationStart: string,
  +registrationEnd: string,
  +votingStart: string,
  +votingEnd: string,
  +votingPowerThreshold: string,
|};

export type CatalystRoundInfoResponse = {|
  currentFund?: CatalystRound,
  nextFund?: CatalystRound
|};

export type CatalystRoundInfoFunc = (body: CatalystRoundInfoRequest)
                                      => Promise<CatalystRoundInfoResponse>;

// Multi Asset Mint Metadata

export type MultiAssetMintMetadataFunc = (body: MultiAssetMintMetadataRequest)
  => Promise<MultiAssetMintMetadataResponse>;

export type MultiAssetMintMetadataRequest = {|
  ...BackendNetworkInfo,
  assets: MultiAssetMintMetadataRequestAsset[]
|};

export type MultiAssetMintMetadataRequestAsset = {|
  nameHex: string,
  policy: string
|}

export type MultiAssetMintMetadataResponse = {|
  ...{[key: string]: MultiAssetMintMetadataResponseAsset[]}
|}

export type MultiAssetMintMetadataResponseAsset = {|
  key: string,
  metadata: {[key: string]: any}
|}

export type GetUtxoDataRequest = {|
  ...BackendNetworkInfo,
  utxos: Array<{|
    txHash: string,
    txIndex: number,
  |}>
|}

export type UtxoData = {|
  output: {|
    +address: string,
    +amount: string,
    +dataHash: string | null,
    +assets: Array<{|
      +assetId: string,
      +policyId: string,
      +name: string,
      +amount: string,
    |}>,
  |},
  spendingTxHash: string | null,
|};

export type GetUtxoDataResponse = Array<UtxoData | null>;

export type GetUtxoDataFunc = (body: GetUtxoDataRequest) => Promise<GetUtxoDataResponse>;
