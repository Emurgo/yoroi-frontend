// @flow

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

export type RemoteTransactionUtxoInput = {|
  +id: string, // concatenation of txHash || index
  +index: number,
  +txHash: string,
|};
export type RemoteTransactionInputBase = {|
  +address: string,
  +amount: string,
|};
type InputTypesT = {|
  legacyUtxo: void,
  utxo: 'utxo',
|};
export const InputTypes: InputTypesT = Object.freeze({
  legacyUtxo: undefined,
  utxo: 'utxo',
});
export type RemoteTransactionInput = {|
  +type?: $PropertyType<InputTypesT, 'legacyUtxo'>,
  ...RemoteTransactionInputBase,
  ...RemoteTransactionUtxoInput,
|} | {|
  +type: $PropertyType<InputTypesT, 'utxo'>,
  ...RemoteTransactionInputBase,
  ...RemoteTransactionUtxoInput,
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
  +certificates?: Array<RemoteCertificate>,
  +withdrawals?: Array<RemoteWithdrawal>,
|};
export type RemoteTransaction = {|
  // TODO: some flag to differentiate Byron txs from Shelley txs
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

export type RemoteWithdrawal = {|
  address: string,
  amount: string,
|};

export type RemoteCertificate = {|
  payloadHex: string,
|};
