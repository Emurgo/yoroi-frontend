// @flow

import type { lf$Database } from 'lovefield';
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
import { migrateToLatest } from '../ada/lib/storage/adaMigration';
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
} from './types';
import LocalStorageApi from '../localStorage/index';
import { clear } from '../ada/lib/storage/database/index';
import type {
  IRenameFunc, IRenameRequest, IRenameResponse,
  IChangePasswordRequestFunc, IChangePasswordRequest, IChangePasswordResponse,
} from '../ada/lib/storage/models/common/interfaces';
import { WrongPassphraseError } from '../ada/lib/cardanoCrypto/cryptoErrors';

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
export type GetForeignAddressesResponse = Array<string>;
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
|};
export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
  ...
};
export type GetTransactionsFunc = (
  request: BaseGetTransactionsRequest
) => Promise<GetTransactionsResponse>;

export type ExportTransactionsRequest = {|
  ticker: string,
  rows: Array<TransactionExportRow>,
  format?: TransactionExportDataFormat,
  fileType?: TransactionExportFileType,
  fileName?: string,
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
      Logger.info(`${nameof(CommonApi)}::${nameof(this.createAddress)} success: ` + stringifyData(newAddress));
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

  async migrate(
    localstorageApi: LocalStorageApi,
    persistentDb: lf$Database,
  ): Promise<boolean> {
    return await migrateToLatest(
      localstorageApi,
      persistentDb,
    );
  }

  async importLocalDatabase(
    db: lf$Database,
    data: {...},
  ): Promise<void> {
    await clear(db);
    await db.import(data);
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
