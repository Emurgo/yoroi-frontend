// @flow

import type { CertificateKindType } from '@emurgo/js-chain-libs/js_chain_libs';
import type { BackendNetworkInfo } from '../../../common/lib/state-fetch/types';

// getUTXOsForAddresses

export type AddressUtxoRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type AddressUtxoResponse = Array<RemoteUnspentOutput>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

// getUTXOsSumsForAddresses

export type UtxoSumRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type UtxoSumResponse = {| sum: ?string, |};
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

// getRewardHistory

export type RewardHistoryRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>,
|};
export type RewardTuple = [
  number, /* epoch */
  number, /* amount in lovelaces */
  string, /* poolHash */
];
export type RewardHistoryResponse = { [address: string]: Array<RewardTuple>, ... };
export type RewardHistoryFunc = (body: RewardHistoryRequest) => Promise<RewardHistoryResponse>;

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

// getAccountState

export type AccountStateRequest = {|
  ...BackendNetworkInfo,
  addresses: Array<string>
|};
export type PoolTuples = [
  string, // PoolId
  number, // parts
];
export type AccountStateDelegation = {|
  pools: Array<PoolTuples>,
|};
export type AccountStateSuccess = {|
  delegation: AccountStateDelegation,
  value: number,
  counter: number,
|};
export type AccountStateFailure = {|
  error: string,
  comment: string,
|};
export type AccountStateResponse = {|
  [key: string]: (AccountStateSuccess | AccountStateFailure),
|};
export type AccountStateFunc = (body: AccountStateRequest) => Promise<AccountStateResponse>;

// getPoolInfo

export type PoolInfoRequest = {|
  ...BackendNetworkInfo,
  ids: Array<string>
|};
export type RemotePoolMetaSuccess = {|
  info: ?{|
    name?: string,
    ticker?: string,
    description?: string,
    homepage?: string,
  |},
  history: Array<{|
    epoch: number,
    slot: number,
    tx_ordinal: number,
    cert_ordinal: number,
    payload: RemoteCertificate,
  |}>,
  owners: ?{
    [key: string]: {|
      pledgeAddress: string,
    |},
    ...
  },
|};
export type RemotePoolMetaFailure = {|
  error: string,
|};
export type PoolInfoResponse = {|
  [key: string]: (RemotePoolMetaSuccess | RemotePoolMetaFailure)
|};
export type PoolInfoFunc = (body: PoolInfoRequest) => Promise<PoolInfoResponse>;

// getReputation

export type ReputationObject = {
  node_flags?: number,
  // note: could be more metrics that are not handled
  ...
};
export type ReputationRequest = {|
  ...BackendNetworkInfo,
|};
export type ReputationResponse = {| [poolId: string]: ReputationObject, |};
export type ReputationFunc = (body: ReputationRequest) => Promise<ReputationResponse>;

/* Backend service data types */

export type RemoteTxState = 'Successful' | 'Failed' | 'Pending';

export type RemoteTransactionUtxoInput = {|
  +id: string, // concatenation of txHash || index
  +index: number,
  +txHash: string,
|};
export type RemoteTransactionAccountingInput = {|
  +id: string, // concatenation of accountAddress || spendingCounter
  +spendingCounter: number,
|};
export type RemoteTransactionInputBase = {|
  +address: string,
  +amount: string,
|};
type InputTypesT = {|
  legacyUtxo: void,
  utxo: 'utxo',
  account: 'account',
|};
export const InputTypes: InputTypesT = Object.freeze({
  legacyUtxo: undefined,
  utxo: 'utxo',
  account: 'account',
});
export type RemoteTransactionInput = {|
  +type?: $PropertyType<InputTypesT, 'legacyUtxo'>,
  ...RemoteTransactionInputBase,
  ...RemoteTransactionUtxoInput,
|} | {|
  +type: $PropertyType<InputTypesT, 'utxo'>,
  ...RemoteTransactionInputBase,
  ...RemoteTransactionUtxoInput,
|} | {|
  +type: $PropertyType<InputTypesT, 'account'>,
  ...RemoteTransactionInputBase,
  ...RemoteTransactionAccountingInput,
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
export type RemoteCertificate = {|
  payloadKind: 'PoolRegistration' | 'PoolUpdate' | 'PoolRetirement' | 'StakeDelegation' | 'OwnerStakeDelegation',
  payloadKindId: CertificateKindType,
  payloadHex: string,
|};
export type RemoteTxInfo = {|
  +hash: string,
  +last_update: string, // timestamp with timezone
  +tx_state: RemoteTxState,
  +inputs: Array<RemoteTransactionInput>,
  +outputs: Array<RemoteTransactionOutput>,
  +certificate?: RemoteCertificate,
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
