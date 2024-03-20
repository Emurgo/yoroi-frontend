// @flow

import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { MultiToken } from '../../../app/api/common/lib/MultiToken';
import type CardanoTxRequest from '../../../app/api/ada';
import type { RemoteUnspentOutput } from '../../../app/api/ada/lib/state-fetch/types';
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

export type PaginateError = {|
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

export const APIErrorCodes = Object.freeze({
  API_INVALID_REQUEST: -1,
  API_INTERNAL_ERROR: -2,
  API_REFUSED: -3,
});
export type APIErrorCode = $Values<typeof APIErrorCodes>;

export type APIError = {|
  code: APIErrorCode,
  info: string
|};

// ----- Types used inside the connector only ----- //

export type PublicDeriverCache = {|
  publicDeriver: PublicDeriver<>,
  name: string,
  balance: MultiToken,
  checksum: void | WalletChecksum,
|}

export type WalletAuthEntry = {|
  walletId: string,
  pubkey: string,
  privkey: string,
|};

export type WhitelistEntry = {|
  url: string,
  protocol: 'cardano',
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
  protocol: 'cardano',
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

export type Protocol = {|
  type: 'cardano'
|}
export type RpcUid = number;

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

export type ConfirmedSignData = {|
  type: 'sign_confirmed',
  tx: CardanoTx | CardanoTxRequest | Array<RemoteUnspentOutput> | null,
  uid: RpcUid,
  tabId: number,
  pw: string,
  // hardware wallet:
  witnessSetHex?: ?string,
|};

export type FailedSignData = {|
  type: 'sign_rejected',
  uid: RpcUid,
  tabId: number,
|} | {|
  type: 'sign_error',
  errorType: 'string',
  data: string,
  uid: RpcUid,
  tabId: number,
|}
export type ConnectResponseData = {|
  type: 'connect_response',
  accepted: true,
  publicDeriverId: number,
  auth: ?WalletAuthEntry,
  tabId: ?number,
|} | {|
  type: 'connect_response',
  accepted: false,
  tabId: ?number,
|}

export type GetUtxosRequest = {|
  type: 'get_utxos/addresses',
  tabId: number,
  select: string[],
|}

export type TxSignWindowRetrieveData = {|
  type: 'tx_sign_window_retrieve_data',
|}
export type ConnectRetrieveData = {|
  type: 'connect_retrieve_data',
|}

export type RemoveWalletFromWhitelistData = {|
  type: 'remove_wallet_from_whitelist',
  url: string,
|}

export type GetConnectedSitesData = {|
  type: 'get_connected_sites',
|}

export type GetConnectionProtocolData = {|
  type: 'get_protocol',
|}

// Errors: Yoroi-only

// if thrown within an API call, these will be returned instead of converted into an internal error
export type AllErrors = TxSendError | TxSignError | APIError | DataSignError | PaginateError;

export class ConnectorError extends Error {
  e: AllErrors

  constructor(e: AllErrors) {
    super(JSON.stringify(e));
    this.e = e;
  }

  toAPIError(): AllErrors {
    return this.e;
  }

  static invalidRequest(info: string): ConnectorError {
    return new ConnectorError({
      code: APIErrorCodes.API_INVALID_REQUEST,
      info,
    });
  }
}
