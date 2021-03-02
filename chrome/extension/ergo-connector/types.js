// @flow

import type { WalletChecksum } from '@emurgo/cip4-js';

export type Address = string;

export type Box = {|
  ...BoxCandidate,
  transactionId: TxId,
  index: number,
|};

export type BoxCandidate = {|
  boxId: BoxId,
  value: Value,
  ergoTree: ErgoTree,
  assets: TokenAmount[],
  additionalRegisters: {| [string]: Constant |},
  creationHeight: number,
|};

// hex string box id
export type BoxId = string;

// hex bytes of sigma-rust encoding
export type Constant = string;

// empty object is for P2PK
// values map is from id to hex-encodd Sigma-state value
export type ContextExtension = {||} | {|
    values: {| [string]: string |}
|};

// hex-encoded bytes
export type ErgoTree = string;

export type DataInput = {|
    boxId: BoxId,
|};

export type SignedInput = {|
  ...UnsignedInput,
  spendingProof: ProverResult,
|};

export type UnsignedInput = {|
  boxId: BoxId,
  extension: ContextExtension,
|};

export type Paginate = {|
  page: number,
  limit: number,
|};

export type PaginateError = {|
    maxSize: number,
|};

export type ProverResult = {|
    proofBytes: string,
    extension: ContextExtension,
|};

export type SignedTx = {|
  id: TxId,
  inputs: SignedInput[],
  dataInputs: DataInput[],
  outputs: Box[],
  size: number,
|};

export type TokenAmount = {|
  tokenId: TokenId,
  amount: Value,
|};

export type TokenId = string;

export type Tx = {|
  id: TxId,
  inputs: UnsignedInput[],
  dataInputs: DataInput[],
  outputs: BoxCandidate[],
|};

export type TxId = string;

export const TxSendErrorCodes = Object.freeze({
  REFUSED: 1,
  FAILURE: 2,
});
export type TxSendErrorCode = $Values<typeof TxSendErrorCodes>;

export type TxSendError = {|
	code: TxSendErrorCode,
	info: string,
|};

export const TxSignErrorCodes = Object.freeze({
  PROOF_GENERATION: 1,
  USER_DECLINED: 2,
});
export type TxSignErrorCode = $Values<typeof TxSignErrorCodes>;

export type TxSignError = {|
	code: TxSignErrorCode,
	info: string,
|};

export const DataSignErrorCodes = Object.freeze({
  DATA_SIGN_PROOF_GENERATION: 1,
  DATA_SIGN_ADDRESS_NOT_PK: 2,
  DATA_SIGN_USER_DECLINED: 3,
  DATA_SIGN_INVALID_FORMAT: 4,
});
export type DataSignErrorCode = $Values<typeof DataSignErrorCodes>;

export type DataSignError = {|
  code: DataSignErrorCode,
  info: string
|};

export type Value = number | string;

export type AccountInfo = {|
  name: string,
  balance: Value,
  checksum: void | WalletChecksum,
|}

export type WhitelistEntry = {| url: string, walletIndex: number |};

export type ConnectingMessage = {| tabId: number, url: string |};
export type SigningMessage = {| sign: PendingSignData, tabId: number |};

export type RpcUid = number;

export type PendingSignData = {|
  type: 'tx',
  uid: RpcUid,
  tx: Tx
|} | {|
  type: 'tx_input',
  uid: RpcUid,
  tx: Tx,
  index: number,
|} | {|
  type: 'data',
  uid: RpcUid,
  address: Address,
  bytes: string
|}

export type ConfirmedSignData = {|
  type: 'sign_confirmed',
  tx: Tx,
  uid: RpcUid,
  tabId: number,
  pw: string,
|};

export type FailedSignData = {|
  type: 'sign_rejected',
  uid: RpcUid,
  tabId: number,
|}

