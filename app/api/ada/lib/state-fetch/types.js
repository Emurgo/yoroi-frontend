// @flow

import type { CertificateKindType } from '@emurgo/js-chain-libs/js_chain_libs';

// getUTXOsForAddresses

export type AddressUtxoRequest = {
  addresses: Array<string>,
};
export type AddressUtxoResponse = Array<RemoteUnspentOutput>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

// getTxsBodiesForUTXOs

export type TxBodiesRequest = { txsHashes: Array<string> };
export type TxBodiesResponse = {
  [key: string]:string
};
export type TxBodiesFunc = (body: TxBodiesRequest) => Promise<TxBodiesResponse>;

// getUTXOsSumsForAddresses

export type UtxoSumRequest = {
  addresses: Array<string>,
};
export type UtxoSumResponse = {
  sum: ?string
};
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
export type BestBlockResponse = {
  height: number, // 0 if no blocks in db
  // null when no blocks in db
  epoch: null | number,
  slot: null | number,
  hash: null | string,
};
export type BestBlockFunc = (body: BestBlockRequest) => Promise<BestBlockResponse>;

// sendTx

export type SignedRequestInternal = {|
  signedTx: string,
|};
export type SignedRequest = {|
  id: string,
  encodedTx: Uint8Array,
|};
export type SignedResponse = {
  txId: string
};
export type SendFunc = (body: SignedRequest) => Promise<SignedResponse>;

// checkAddressesInUse

export type FilterUsedRequest = {
  addresses: Array<string>
};
export type FilterUsedResponse = Array<string>;
export type FilterFunc = (body: FilterUsedRequest) => Promise<FilterUsedResponse>;

// getAccountState

export type AccountStateRequest = {|
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
export type AccountStateResponse = { [key: string]: (AccountStateSuccess | AccountStateFailure) };
export type AccountStateFunc = (body: AccountStateRequest) => Promise<AccountStateResponse>;

// getPoolInfo

export type PoolInfoRequest = {|
  ids: Array<string>
|};
export type RemotePoolMetaSuccess = {|
  state: {|
    // TODO
  |},
  poolMeta: ?{|
    name: string,
    description: string,
    ticker: string,
    homepage: string,
  |},
  ownerMeta: ?{
    [key: string]: {|
      // TODO
    |}
  },
|};
export type RemotePoolMetaFailure = {|
  error: string,
|};
export type PoolInfoResponse = { [key: string]: (RemotePoolMetaSuccess | RemotePoolMetaFailure) };
export type PoolInfoFunc = (body: PoolInfoRequest) => Promise<PoolInfoResponse>;


// checkServer

export type ServerStatusRequest = void;
export type ServerStatusResponse = {
  isServerOk: boolean
};
export type ServerStatusFunc = (body: ServerStatusRequest) => Promise<ServerStatusResponse>;

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
