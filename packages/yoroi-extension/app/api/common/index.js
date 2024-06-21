// @flow

import type { lf$Database } from 'lovefield';
import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import {
  loadWalletsFromStorage,
} from '../ada/lib/storage/models/load';
import {
  PublicDeriver,
} from '../ada/lib/storage/models/PublicDeriver/index';
import {
  GenericApiError, IncorrectWalletPasswordError,
} from './errors';
import LocalizableError from '../../i18n/LocalizableError';
import type {
  IPublicDeriver,
  IGetLastSyncInfo,
  IGetLastSyncInfoResponse,
  IDisplayCutoffPopFunc,
  IDisplayCutoffPopResponse,
} from '../ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../ada/lib/storage/models/ConceptualWallet/interfaces';
import WalletTransaction from '../../domain/WalletTransaction';
import type {
  TransactionExportRow,
  TransactionExportDataFormat,
  TransactionExportFileType
} from '../export';
import type {
  GetBalanceRequest, GetBalanceResponse,
  SendTokenList,
} from './types';
import type {
  IRenameFunc, IRenameRequest, IRenameResponse,
  IChangePasswordRequestFunc, IChangePasswordRequest, IChangePasswordResponse,
} from '../ada/lib/storage/models/common/interfaces';
import { WrongPassphraseError } from '../ada/lib/cardanoCrypto/cryptoErrors';
import type { TokenRow } from '../ada/lib/storage/database/primitives/tables';
import type { CoreAddressT, } from '../ada/lib/storage/database/primitives/enums';
import { getAllTokenInfo } from './lib/tokens/utils';
import { MultiToken } from './lib/MultiToken';
import type { DefaultTokenEntry } from './lib/MultiToken';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmount.types';

// getTokenInfo

export type GetTokenInfoRequest = {|
  db: lf$Database,
|};
export type GetTokenInfoResponse = $ReadOnlyArray<$ReadOnly<TokenRow>>;
export type GetTokenInfoFunc = (
  request: GetTokenInfoRequest
) => Promise<GetTokenInfoResponse>;

// getWallets

export type GetWalletsRequest = {| db: lf$Database, |};
export type GetWalletsResponse = Array<PublicDeriver<>>;
export type GetWalletsFunc = (
  request: GetWalletsRequest
) => Promise<GetWalletsResponse>;

export async function getWallets(
  request: GetWalletsRequest,
): Promise<GetWalletsResponse> {
  Logger.debug(`${nameof(getWallets)} called`);
  try {
    const wallets = await loadWalletsFromStorage(request.db);
    Logger.debug(`${nameof(getWallets)} success: ` + stringifyData(wallets));
    return wallets;
  } catch (error) {
    Logger.error(`${nameof(getWallets)} error: ` + stringifyError(error));
    if (error instanceof LocalizableError) throw error;
    throw new GenericApiError();
  }
}

// refreshPendingTransactions

export type RefreshPendingTransactionsRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetLastSyncInfo,
|};
export type RefreshPendingTransactionsResponse = Array<WalletTransaction>;
export type RefreshPendingTransactionsFunc = (
  request: RefreshPendingTransactionsRequest
) => Promise<RefreshPendingTransactionsResponse>;

// removeAllTransactions

export type RemoveAllTransactionsRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  publicDeriverId: number,
  refreshWallet: () => Promise<void>,
|};
export type RemoveAllTransactionsResponse = void;
export type RemoveAllTransactionsFunc = (
  request: RemoveAllTransactionsRequest
) => Promise<RemoveAllTransactionsResponse>;

// getForeignAddresses

export type GetForeignAddressesRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
|};
export type GetForeignAddressesResponse = Array<{|
  address: string,
  type: CoreAddressT,
|}>;
export type GetForeignAddressesFunc = (
  request: GetForeignAddressesRequest
) => Promise<GetForeignAddressesResponse>;

// getTxLastUpdatedDate

export type GetTxLastUpdateDateRequest = {|
  getLastSyncInfo: () => Promise<IGetLastSyncInfoResponse>,
|};
export type GetTxLastUpdateDateResponse = IGetLastSyncInfoResponse;
export type GetTxLastUpdateDateFunc = (
  request: GetTxLastUpdateDateRequest
) => Promise<GetTxLastUpdateDateResponse>;

// refreshTransactions

export type GetTransactionsRequestOptions = {|
  skip: number,
  limit: number,
|};
export type BaseGetTransactionsRequest = {|
  ...InexactSubset<GetTransactionsRequestOptions>,
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetLastSyncInfo,
  isLocalRequest: boolean,
  beforeTx?: ?WalletTransaction,
  afterTx?: ?WalletTransaction,
|};
export type GetTransactionsResponse = Array<WalletTransaction>;

export type GetTransactionsFunc = (
  request: BaseGetTransactionsRequest
) => Promise<GetTransactionsResponse>;

export type GetTransactionsDataResponse = {|
  hash: number,
  totalAvailable: number,
  unconfirmedAmount: ?UnconfirmedAmount,
  remoteTransactionIds: Set<string>,
  timestamps: Array<number>,
  assetIds: Array<string>,
|};

export type GetTransactionsDataFunc = (
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetLastSyncInfo,
    isLocalRequest: boolean,
  |}
) => Promise<GetTransactionsDataResponse>;

export type ExportTransactionsRequest = {|
  ticker: string,
  rows: Array<TransactionExportRow>,
  nameSuffix: string,
  shouldIncludeTxIds: boolean,
  format?: TransactionExportDataFormat,
  fileType?: TransactionExportFileType,
|};
export type ExportTransactionsResponse = void;  // TODO: Implement in the Next iteration
export type ExportTransactionsFunc = (
  request: ExportTransactionsRequest
) => Promise<ExportTransactionsResponse>;

// createAddress

export type CreateAddressRequest = {| popFunc: IDisplayCutoffPopFunc, |};
export type CreateAddressResponse = IDisplayCutoffPopResponse;
export type CreateAddressFunc = (
  request: CreateAddressRequest
) => Promise<CreateAddressResponse>;

// renameModel

export type RenameModelRequest = {|
  func: IRenameFunc,
  request: IRenameRequest,
|};
export type RenameModelResponse = IRenameResponse;
export type RenameModelFunc = (
  request: RenameModelRequest
) => Promise<RenameModelResponse>;

// changeModelPassword

export type ChangeModelPasswordRequest = {|
  func: IChangePasswordRequestFunc,
  request: IChangePasswordRequest,
|};
export type ChangeModelPasswordResponse = IChangePasswordResponse;
export type ChangeModelPasswordFunc = (
  request: ChangeModelPasswordRequest
) => Promise<ChangeModelPasswordResponse>;


export default class CommonApi {

  async getTokenInfo(
    request: GetTokenInfoRequest,
  ): Promise<GetTokenInfoResponse> {
    Logger.debug(`${nameof(this.getTokenInfo)} called`);
    try {
      const tokens = await getAllTokenInfo(request);
      Logger.debug(`${nameof(this.getTokenInfo)} success: ` + stringifyData(tokens));
      return tokens;
    } catch (error) {
      Logger.error(`${nameof(this.getTokenInfo)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async getTxLastUpdatedDate(
    request: GetTxLastUpdateDateRequest
  ): Promise<GetTxLastUpdateDateResponse> {
    try {
      return await request.getLastSyncInfo();
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.getTxLastUpdatedDate)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createAddress(
    request: CreateAddressRequest,
  ): Promise<CreateAddressResponse> {
    Logger.debug(`${nameof(CommonApi)}::${nameof(this.createAddress)} called`);
    try {

      const newAddress = await request.popFunc();
      Logger.debug(`${nameof(CommonApi)}::${nameof(this.createAddress)} success: ` + stringifyData(newAddress));
      return newAddress;
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.createAddress)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async getBalance(
    request: GetBalanceRequest
  ): Promise<GetBalanceResponse> {
    try {
      const balance = await request.getBalance();
      return balance;
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.getBalance)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async getAssetDeposit(
    request: GetBalanceRequest
  ): Promise<GetBalanceResponse> {
    try {
      return await request.getBalance();
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.getAssetDeposit)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async exportLocalDatabase(
    db: lf$Database,
  ): Promise<string> {
    const data = await db.export();
    return JSON.stringify(data);
  }

  async renameModel(
    request: RenameModelRequest
  ): Promise<RenameModelResponse> {
    Logger.debug(`${nameof(CommonApi)}::${nameof(this.renameModel)} called: ` + stringifyData(request));
    try {
      const result = await request.func(request.request);
      Logger.debug(`${nameof(CommonApi)}::${nameof(this.renameModel)} success: ` + stringifyData(result));
      return result;
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.renameModel)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async changeModelPassword(
    request: ChangeModelPasswordRequest
  ): Promise<ChangeModelPasswordResponse> {
    Logger.debug(`${nameof(CommonApi)}::${nameof(this.changeModelPassword)} called`);
    try {
      const result = await request.func(request.request);
      Logger.debug(`${nameof(CommonApi)}::${nameof(this.changeModelPassword)} success`);
      return result;
    } catch (error) {
      Logger.error(
        `${nameof(CommonApi)}::${nameof(this.changeModelPassword)} error: ` + stringifyError(error)
      );
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }
}

export function hasSendAllDefault(
  tokens: SendTokenList,
): boolean {
  const defaultSendAll = tokens.find(token => {
    if (token.shouldSendAll === true && token.token.IsDefault) return true;
    return false;
  });
  return defaultSendAll != null;
}

/**
 * Construct the list of what will be included in the tx output
*/
export function builtSendTokenList(
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  utxos: Array<MultiToken>,
): MultiToken {
  const amount = new MultiToken([], defaultToken);

  for (const token of tokens) {
    if (token.amount != null) {
      // if we add a specific amount of a specific token to the output, just add it
      amount.add({
        amount: new BigNumber(token.amount),
        identifier: token.token.Identifier,
        networkId: token.token.NetworkId,
      });
    } else if (token.token.IsDefault) {
      // if we add a non-specific amount of the default token
      // sum amount values in the UTXO
      const relatedUtxoSum = utxos.reduce(
        (value, next) => value.plus(next.getDefaultEntry().amount),
        new BigNumber(0)
      );
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.Identifier,
        networkId: token.token.NetworkId,
      });
    } else {
      // if we add a non-specific amount of a given token
      // sum up the value of all our UTXOs with this token
      const relatedUtxoSum = utxos.reduce(
        (value, next) => {
          const assetEntry = next.nonDefaultEntries().find(
            entry => entry.identifier === token.token.Identifier
          );
          if (assetEntry != null) {
            return value.plus(assetEntry.amount);
          }
          return value;
        },
        new BigNumber(0)
      );
      amount.add({
        amount: relatedUtxoSum,
        identifier: token.token.Identifier,
        networkId: token.token.NetworkId,
      });
    }
  }
  return amount;
}
