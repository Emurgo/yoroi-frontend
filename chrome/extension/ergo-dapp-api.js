// @flow

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
  assets: [TokenAmount],
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
  inputs: [SignedInput],
  dataInputs: [DataInput],
  outputs: [Box],
  size: number,
|};

export type TokenAmount = {|
  tokenId: TokenId,
  amount: Value,
|};

export type TokenId = string;

export type Tx = {|
  id: TxId,
  inputs: [UnsignedInput],
  dataInputs: [DataInput],
  outputCandidates: [BoxCandidate],
|};

export type TxId = string;

export type TxSendRefused = 1;
export type TxSendFailure = 2;
export type TxSendErrorCode = TxSendRefused | TxSendFailure;

export type TxSendError = {|
	code: TxSendErrorCode,
	info: string,
|};

export type TxSignProofGeneration = 1;
export type TxSignUserDeclined = 2;
export type TxSignErrorCode = TxSignProofGeneration | TxSignUserDeclined;

export type TxSignError = {|
	code: TxSignErrorCode,
	info: string,
|};

export type DataSignProofGeneration = 1;
export type DataSignAddressNotPK = 2;
export type DataSignUserDeclined = 3;
export type DataSignInvalidFormat = 4;
export type DataSignErrorCode = DataSignProofGeneration
                       | DataSignAddressNotPK
                       | DataSignUserDeclined
                       | DataSignInvalidFormat;

export type DataSignError = {|
  code: DataSignErrorCode,
  info: String
|};

export type Value = number | string;