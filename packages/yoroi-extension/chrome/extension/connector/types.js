// @flow

import type { IGetAllUtxosResponse } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';

// ----- Types used in the dApp <-> Yoroi connection bridge ----- //

// the as* conversion functions do structural verification/sanitation on
// raw data received from the connector and throw an Error if it does not
// conform to the flow definitions (+ additional checks in some cases)

export type Address = string;

export type Paginate = {|
  page: number,
  limit: number,
|};

export function asPaginate(input: any): Paginate {
  if (typeof input === 'object' && typeof input.page === 'number' && typeof input.limit === 'number') {
    return {
      page: input.page,
      limit: input.limit
    };
  }
  throw ConnectorError.invalidRequest(`invalid Paginate: ${JSON.stringify(input)}`);
}

type PaginateError = {|
    maxSize: number,
|};

export type TokenId = string;

export function asTokenId(input: any): TokenId {
  if (typeof input === 'string') {
    return input;
  }
  throw ConnectorError.invalidRequest(`invalid TokenId: ${JSON.stringify(input)}`);
}

export type CardanoTx = {|
  tx: string,
  partialSign: boolean,
  tabId: number,
|};

export type Value = string;

export type AccountBalance = {|
  default: string,
  networkId: number,
  assets: Array<Asset>,
|};

export type Asset = {|
  identifier: string,
  networkId: number,
  amount: string,
|};

export function asValue(input: any): Value {
  if (typeof input === 'string') {
    return input;
  }
  throw ConnectorError.invalidRequest(`Value must be a string: : ${JSON.stringify(input)}`);
}

// Errors (Exposed to dApps):

export const TxSendErrorCodes = Object.freeze({
  REFUSED: 1,
  FAILURE: 2,
});

type TxSendError = {|
	code: $Values<typeof TxSendErrorCodes>,
	info: string,
|};

export const TxSignErrorCodes = Object.freeze({
  PROOF_GENERATION: 1,
  USER_DECLINED: 2,
});

type TxSignError = {|
	code: $Values<typeof TxSignErrorCodes>,
	info: string,
|};

export const DataSignErrorCodes = Object.freeze({
  DATA_SIGN_PROOF_GENERATION: 1,
  DATA_SIGN_ADDRESS_NOT_PK: 2,
  DATA_SIGN_USER_DECLINED: 3,
  DATA_SIGN_INVALID_FORMAT: 4,
});

type DataSignError = {|
  code: $Values<typeof DataSignErrorCodes>,
  info: string
|};

export const APIErrorCodes = Object.freeze({
  API_INVALID_REQUEST: -1,
  API_INTERNAL_ERROR: -2,
  API_REFUSED: -3,
});

type APIError = {|
  code: $Values<typeof APIErrorCodes>,
  info: string
|};

// ----- Types used inside the connector only ----- //

export type WalletAuthEntry = {|
  walletId: string,
  pubkey: string,
  privkey: string,
|};

export type WhitelistEntry = {|
  url: string,
  publicDeriverId: number,
  appAuthID: ?string,
  auth: ?WalletAuthEntry,
  image: string,
|};

export type ConnectingMessage = {|
  tabId: number,
  url: string,
  appAuthID?: string,
  imgBase64Url: string,
|};

export type SigningMessage = {|
  publicDeriverId: number,
  sign: PendingSignData,
  tabId: number,
  requesterUrl: string,
|};

export type ConnectedSites = {|
  sites: Array<string>,
|};

type RpcUid = number;

export type PendingSignData = {|
  type: 'data',
  uid: RpcUid,
  address: Address,
  payload: string
|} | {|
  type: 'tx/cardano',
  uid: RpcUid,
  tx: CardanoTx,
|} | {|
  type: 'tx-reorg/cardano',
  uid: RpcUid,
  tx: {|
    usedUtxoIds: Array<string>,
    reorgTargetAmount: string,
    utxos: IGetAllUtxosResponse,
  |},
|};

// Errors: Yoroi-only

// if thrown within an API call, these will be returned instead of converted into an internal error
type ConnectorApiError = TxSendError | TxSignError | APIError | DataSignError | PaginateError;

export class ConnectorError extends Error {
  e: ConnectorApiError

  constructor(e: ConnectorApiError) {
    super(JSON.stringify(e));
    this.e = e;
  }

  toAPIError(): ConnectorApiError {
    return this.e;
  }

  static invalidRequest(info: string): ConnectorError {
    return new ConnectorError({
      code: APIErrorCodes.API_INVALID_REQUEST,
      info,
    });
  }
}
