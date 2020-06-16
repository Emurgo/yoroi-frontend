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
  GenericApiError, UnusedAddressesError,
} from './errors';
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
import {
  getPendingTransactions,
} from '../ada/lib/storage/bridge/updateTransactions';
import type {
  TransactionExportRow,
  TransactionExportDataFormat,
  TransactionExportFileType
} from '../export';
import { getApiForCoinType } from './utils';
import type { GetBalanceRequest, GetBalanceResponse } from './types';

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


export default class CommonApi {
  async getTxLastUpdatedDate(
    request: GetTxLastUpdateDateRequest
  ): Promise<GetTxLastUpdateDateResponse> {
    try {
      return await request.getLastSyncInfo();
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.getTxLastUpdatedDate)} error: ` + stringifyError(error));
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
      if (error instanceof UnusedAddressesError) {
        throw error;
      }
      Logger.error(`${nameof(CommonApi)}::${nameof(this.createAddress)} error: ` + stringifyError(error));
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
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(
    request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug(`${nameof(CommonApi)}::${nameof(this.refreshPendingTransactions)} called`);
    try {
      const fetchedTxs = await getPendingTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(CommonApi)}::${nameof(this.refreshPendingTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return WalletTransaction.fromAnnotatedTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          api: getApiForCoinType(request.publicDeriver.getParent().getCoinType()),
        });
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error(`${nameof(CommonApi)}::${nameof(this.refreshPendingTransactions)} error: ` + stringifyError(error));
      throw new GenericApiError();
    }
  }
}
