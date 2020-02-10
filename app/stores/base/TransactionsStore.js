// @flow
import BigNumber from 'bignumber.js';
import { observable, computed, action, } from 'mobx';
import { find } from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import WalletTransaction from '../../domain/WalletTransaction';
import type { GetTransactionsFunc, GetBalanceFunc,
  GetTransactionsRequest, GetTransactionsRequestOptions,
  RefreshPendingTransactionsFunc } from '../../api/ada';
import environment from '../../environment';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetBalance, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetLastSyncInfo,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { WalletWithCachedMeta } from '../toplevel/WalletStore';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';

export default class TransactionsStore extends Store {

  /** How many transactions to display */
  INITIAL_SEARCH_LIMIT: number = 5;

  /** How many additonal transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE: number = 5;

  /** Skip first n transactions from api */
  SEARCH_SKIP: number = 0;

  /** Track transactions for a set of wallets */
  @observable transactionsRequests: Array<{|
    publicDeriver: PublicDeriver<>,
    pendingRequest: CachedRequest<RefreshPendingTransactionsFunc>,
    recentRequest: CachedRequest<GetTransactionsFunc>,
    allRequest: CachedRequest<GetTransactionsFunc>,
    getBalanceRequest: CachedRequest<GetBalanceFunc>,
  |}> = [];

  @observable _searchOptionsForWallets: Array<{|
    publicDeriver: PublicDeriver<>,
    options: GetTransactionsRequestOptions,
  |}> = [];

  _hasAnyPending: boolean = false;

  setup(): void {
    super.setup();
    const actions = this.actions[environment.API].transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
  }

  @action _increaseSearchLimit: WalletWithCachedMeta => Promise<void> = async (
    publicDeriver
  ) => {
    if (this.searchOptions != null) {
      this.searchOptions.limit += this.SEARCH_LIMIT_INCREASE;
      await this.refreshLocal(publicDeriver.self);
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const publicDeriver = this.stores.wallets.selected;
    // TODO: Do not return new request here
    if (!publicDeriver) {
      return new CachedRequest<GetTransactionsFunc>(
        this.api[environment.API].refreshTransactions
      );
    }
    return this._getTransactionsRecentRequest(publicDeriver.self);
  }

  /** Get (or create) the search options for the active wallet (if any)  */
  @computed get searchOptions(): ?GetTransactionsRequestOptions {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return null;
    const foundSearchOptions = find(
      this._searchOptionsForWallets,
      { publicDeriver: publicDeriver.self }
    );
    if (!foundSearchOptions) {
      throw new Error(`${nameof(this.searchOptions)} no option found`);
    }
    return foundSearchOptions.options;
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this._getTransactionsRecentRequest(publicDeriver.self).result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsRecentRequest(publicDeriver.self).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsPendingRequest(publicDeriver.self).result;
    if (result) {
      this._hasAnyPending = result.length > 0;
    }
    return this._hasAnyPending;
  }

  @computed get totalAvailable(): number {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return 0;
    const result = this.getTransactionsAllRequest(publicDeriver.self).result;
    return result ? result.transactions.length : 0;
  }

  /** Refresh transaction data for all wallets and update wallet balance */
  @action refreshTransactionData: WalletWithCachedMeta => Promise<void> = async (
    basePubDeriver
  ) => {
    const walletsActions = this.actions.wallets;

    const publicDeriver = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(basePubDeriver.self);
    if (publicDeriver == null) {
      return;
    }

    // All Request
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const {
      getTransactionsHistoryForAddresses,
      checkAddressesInUse,
      getBestBlock
    } = stateFetcher;
    const allRequest = this.getTransactionsAllRequest(basePubDeriver.self);
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: false,
      getTransactionsHistoryForAddresses,
      checkAddressesInUse,
      getBestBlock,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    await allRequest.promise
      .then(async () => {
        // calculate pending transactions just to cache the result
        const pendingRequest = this._getTransactionsPendingRequest(basePubDeriver.self);
        pendingRequest.invalidate({ immediately: false });
        pendingRequest.execute(
          { publicDeriver }
        );
        if (!pendingRequest.promise) throw new Error('should never happen');
        await pendingRequest.promise;

        const canGetBalance = asGetBalance(basePubDeriver.self);
        if (canGetBalance == null) {
          return new BigNumber(0);
        }
        const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate({
          getLastSyncInfo: publicDeriver.getLastSyncInfo
        });
        walletsActions.updateLastSync.trigger({
          lastSync: lastUpdateDate,
          publicDeriver: basePubDeriver,
        });
        // Note: cache based on last slot synced  (not used in balanceRequest)
        const req = this._getBalanceRequest(basePubDeriver.self);
        req.execute({
          getBalance: canGetBalance.getBalance,
        });
        if (!req.promise) throw new Error('should never happen');
        return req.promise;
      })
      .then((updatedBalance) => {
        walletsActions.updateBalance.trigger({
          balance: updatedBalance,
          publicDeriver: basePubDeriver,
        });
        return undefined;
      })
      .then(() => {
        // Recent Request
        // Here we are sure that allRequest was resolved and the local database was updated
        return this.refreshLocal(basePubDeriver.self);
      });
  };

  @action refreshLocal: (
    PublicDeriver<> & IGetLastSyncInfo
  ) => Promise<PromisslessReturnType<GetTransactionsFunc>> = (
    publicDeriver: PublicDeriver<> & IGetLastSyncInfo,
  ) => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;

    const limit = this.searchOptions
      ? this.searchOptions.limit
      : this.INITIAL_SEARCH_LIMIT;
    const skip = this.searchOptions
      ? this.searchOptions.skip
      : this.SEARCH_SKIP;

    const withLevels = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(publicDeriver);
    if (withLevels == null) {
      throw new Error('refreshLocal no levels');
    }
    const requestParams: GetTransactionsRequest = {
      publicDeriver: withLevels,
      isLocalRequest: true,
      limit,
      skip,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
    };
    const recentRequest = this._getTransactionsRecentRequest(publicDeriver);
    recentRequest.invalidate({ immediately: false });
    recentRequest.execute(requestParams); // note: different params/cache than allRequests
    if (!recentRequest.promise) throw new Error('should never happen');
    return recentRequest.promise;
  }

  /** Add a new public deriver to track and refresh the data */
  @action addObservedWallet: WalletWithCachedMeta => void = (
    publicDeriver
  ) => {
    this.transactionsRequests.push({
      publicDeriver: publicDeriver.self,
      recentRequest: this._getTransactionsRecentRequest(publicDeriver.self),
      allRequest: this.getTransactionsAllRequest(publicDeriver.self),
      getBalanceRequest: this._getBalanceRequest(publicDeriver.self),
      pendingRequest: this._getTransactionsPendingRequest(publicDeriver.self),
    });
    this._searchOptionsForWallets.push({
      publicDeriver: publicDeriver.self,
      options: {
        limit: this.INITIAL_SEARCH_LIMIT,
        skip: this.SEARCH_SKIP
      }
    });
  }

  _getTransactionsPendingRequest: (
    PublicDeriver<>
  ) => CachedRequest<RefreshPendingTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.pendingRequest) return foundRequest.pendingRequest;
    return new CachedRequest<RefreshPendingTransactionsFunc>(
      this.api[environment.API].refreshPendingTransactions
    );
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITH search options */
  _getTransactionsRecentRequest: PublicDeriver<> => CachedRequest<GetTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.recentRequest) return foundRequest.recentRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITHOUT search options */
  getTransactionsAllRequest: PublicDeriver<> => CachedRequest<GetTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  _getBalanceRequest: (PublicDeriver<>) => CachedRequest<GetBalanceFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.getBalanceRequest) return foundRequest.getBalanceRequest;
    return new CachedRequest<GetBalanceFunc>(this.api[environment.API].getBalance);
  };

}
