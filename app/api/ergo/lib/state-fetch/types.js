// @flow

import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';

export type AddressUtxoRequest = {|
  network: $ReadOnly<NetworkRow>,
  addresses: Array<string>,
|};
export type AddressUtxoResponse = Array<{|
  amount: string,
  receiver: string,
  tx_hash: string,
  tx_index: number,
  utxo_id: string, // concat(tx_hash, tx_index)
|}>;
export type AddressUtxoFunc = (body: AddressUtxoRequest) => Promise<AddressUtxoResponse>;

export type TxBodiesRequest = {|
  network: $ReadOnly<NetworkRow>,
  txHashes: Array<string>,
|};
export type TxBodiesResponse = {|
  [txHash: string]: any // TODO: add this when we need it
|};
export type TxBodiesFunc = (body: TxBodiesRequest) => Promise<TxBodiesResponse>;

export type UtxoSumRequest = {|
  network: $ReadOnly<NetworkRow>,
  addresses: Array<string>,
|};
export type UtxoSumResponse = {|
  sum: string,
|};
export type UtxoSumFunc = (body: UtxoSumRequest) => Promise<UtxoSumResponse>;

export type HistoryRequest = {|
  network: $ReadOnly<NetworkRow>,
  addresses: Array<string>,
  // omitting "after" means you query starting from the genesis block
  after?: {|
    block: string, // block hash
    tx: string, // tx hash
  |},
  untilBlock: string, // block hash - inclusive
|};

export type RemoteTxState = 'Successful' | 'Failed' | 'Pending';

export type RemoteErgoTransaction = {|
  block_hash: string,
  block_num: number,
  hash: string,
  inputs: Array<{
    address: string,
    id: string,
    outputTransactionId: string,
    spendingProof: string,
    transactionId: string,
    value: number,
    ...
  }>,
  outputs: Array<{
    additionalRegisters: { ... },
    address: string,
    assets: Array<{
      amount: number,
      tokenId: string,
      ...
    }>,
    creationHeight: number,
    ergoTree: string,
    id: string,
    txId: string,
    index: number,
    mainChain: boolean,
    spentTransactionId: string,
    value: number,
    ...
  }>,
  // epoch: 0, // TODO
  // slot: 0, // TODO
  time: string, // ISO string
  tx_state: RemoteTxState, // explorer doesn't handle pending transactions
|};
export type HistoryResponse = Array<RemoteErgoTransaction>;
export type HistoryFunc = (body: HistoryRequest) => Promise<HistoryResponse>;

export type BestBlockRequest = {|
  network: $ReadOnly<NetworkRow>,
|};
export type BestBlockResponse = {|
  // epoch: 0, // TODO
  // slot: 0, // TODO
  hash: string,
  height: number,
|};
export type BestBlockFunc = (body: BestBlockRequest) => Promise<BestBlockResponse>;

export type SignedRequest = {|
  network: $ReadOnly<NetworkRow>,
  id?: string, // hex
  inputs: Array<{|
    boxId: string, // hex
    spendingProof: {|
      proofBytes: string, // hex
      extension: {| [key: string]: string /* hex */ |},
    |},
    extension?: {| [key: string]: string /* hex */ |},
  |}>,
  dataInputs: Array<{|
    boxId: string, // hex
    extension?: {| [key: string]: string /* hex */ |},
  |}>,
  outputs: Array<{|
    boxId?: string, // hex
    value: number,
    ergoTree: string, // hex
    creationHeight: number,
    assets?: Array<{|
      tokenId: string, // hex
      amount: number,
    |}>,
    additionalRegisters: {| [key: string]: string /* hex */ |},
    transactionId?: string, // hex
    index?: number,
  |}>,
  size?: number,
|};
export type SignedResponse = {|
  id: string, // hex
|};
export type SendFunc = (body: SignedRequest) => Promise<SignedResponse>;

/* Backend service data types */

export type RemoteTxState = 'Successful' | 'Failed' | 'Pending';
