// @flow
import { observable, computed, action, runInAction } from 'mobx';
import _ from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import WalletTransaction from '../../domain/WalletTransaction';
import type { GetTransactionsFunc, GetBalanceFunc,
  GetTransactionsRequest, GetTransactionsRequestOptions,
  RefreshPendingTransactionsFunc } from '../../api/ada';
import environment from '../../environment';

export default class TransactionsStore extends Store {

  /** How many transactions to display */
  INITIAL_SEARCH_LIMIT = 5;

  /** How many additonall transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE = 5;

  /** Skip first n transactions from api */
  SEARCH_SKIP = 0;

  /** Track transactions for a set of wallets */
  @observable transactionsRequests: Array<{
    walletId: string,
    pendingRequest: CachedRequest<RefreshPendingTransactionsFunc>,
    recentRequest: CachedRequest<GetTransactionsFunc>,
    allRequest: CachedRequest<GetTransactionsFunc>,
    getBalanceRequest: CachedRequest<GetBalanceFunc>
  }> = [];

  @observable _searchOptionsForWallets = observable.map();

  _hasAnyPending: boolean = false;

  setup() {
    const actions = this.actions[environment.API].transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
  }

  @action _increaseSearchLimit = () => {
    if (this.searchOptions != null) {
      this.searchOptions.limit += this.SEARCH_LIMIT_INCREASE;
      this._refreshTransactionData();
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const wallet = this.stores.substores[environment.API].wallets.active;
    // TODO: Do not return new request here
    if (!wallet) {
      return new CachedRequest<GetTransactionsFunc>(
        this.api[environment.API].refreshTransactions
      );
    }
    return this._getTransactionsRecentRequest(wallet.id);
  }

  /** Get (or create) the search options for the active wallet (if any)  */
  @computed get searchOptions(): ?GetTransactionsRequestOptions {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return null;
    let options = this._searchOptionsForWallets.get(wallet.id);
    if (!options) {
      // Setup options for each requested wallet
      runInAction(() => {
        this._searchOptionsForWallets.set(
          wallet.id,
          {
            limit: this.INITIAL_SEARCH_LIMIT,
            skip: this.SEARCH_SKIP
          }
        );
      });
      options = this._searchOptionsForWallets.get(wallet.id);
    }
    return options;
  }

  @computed get recent(): Array<WalletTransaction> {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return [];
    const result = this._getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this._getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this._getTransactionsPendingRequest(wallet.id).result;
    if (result) {
      this._hasAnyPending = result.length > 0;
    }
    return this._hasAnyPending;
  }

  @computed get totalAvailable(): number {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return 0;
    const result = this._getTransactionsAllRequest(wallet.id).result;
    return result ? result.transactions.length : 0;
  }

  /** Refresh transaction data for all wallets and update wallet balance */
  @action _refreshTransactionData = () => {
    const walletsStore = this.stores.substores[environment.API].wallets;
    const walletsActions = this.actions[environment.API].wallets;
    const allWallets = walletsStore.all;
    for (const wallet of allWallets) {
      // All Request
      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;

      const allRequest = this._getTransactionsAllRequest(wallet.id);
      allRequest.invalidate({ immediately: false });
      allRequest.execute({
        walletId: wallet.id,
        isLocalRequest: false,
        getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
        checkAddressesInUse: stateFetcher.checkAddressesInUse,
      });

      if (!allRequest.promise) throw new Error('should never happen');

      allRequest.promise
        .then(async () => {
          // calculate pending tranactions just to cache the result
          const pendingRequest = this._getTransactionsPendingRequest(wallet.id);
          pendingRequest.invalidate({ immediately: false });
          pendingRequest.execute(
            { walletId: wallet.id } // add walletId just for cache
          );

          const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate();
          // Note: cache based on lastUpdateDate even though it's not used in balanceRequest
          const req = this._getBalanceRequest(wallet.id);
          req.execute({
            date: lastUpdateDate,
            getUTXOsSumsForAddresses: stateFetcher.getUTXOsSumsForAddresses,
          });
          if (!req.promise) throw new Error('should never happen');
          return req.promise;
        })
        .then((updatedBalance) => {
          if (walletsStore.active && walletsStore.active.id === wallet.id) {
            walletsActions.updateBalance.trigger(updatedBalance);
          }
          return undefined;
        })
        .then(() => {
          // Recent Request
          // Here we are sure that allRequest was resolved and the local database was updated
          const limit = this.searchOptions
            ? this.searchOptions.limit
            : this.INITIAL_SEARCH_LIMIT;
          const skip = this.searchOptions
            ? this.searchOptions.skip
            : this.SEARCH_SKIP;

          const requestParams: GetTransactionsRequest = {
            walletId: wallet.id,
            isLocalRequest: true,
            limit,
            skip,
            getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
            checkAddressesInUse: stateFetcher.checkAddressesInUse,
          };
          const recentRequest = this._getTransactionsRecentRequest(wallet.id);
          recentRequest.invalidate({ immediately: false });
          recentRequest.execute(requestParams) // note: different params/cache than allRequests
            .then((response) => {
              // Sync with memos stored externally
              this.actions.memos.syncTxMemos.trigger();
            });
          return undefined;
        })
        .catch(() => {}); // Do nothing. It's logged in the api call
    }
  };

  /** Update which walletIds to track and refresh the data */
  @action updateObservedWallets = (
    walletIds: Array<string>
  ): void => {
    this.transactionsRequests = walletIds.map(walletId => ({
      walletId,
      recentRequest: this._getTransactionsRecentRequest(walletId),
      allRequest: this._getTransactionsAllRequest(walletId),
      getBalanceRequest: this._getBalanceRequest(walletId),
      pendingRequest: this._getTransactionsPendingRequest(walletId),
    }));
    this._refreshTransactionData();
  }

  _getTransactionsPendingRequest = (
    walletId: string
  ): CachedRequest<RefreshPendingTransactionsFunc> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.pendingRequest) return foundRequest.pendingRequest;
    return new CachedRequest<RefreshPendingTransactionsFunc>(
      this.api[environment.API].refreshPendingTransactions
    );
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITH search options */
  _getTransactionsRecentRequest = (walletId: string): CachedRequest<GetTransactionsFunc> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.recentRequest) return foundRequest.recentRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITHOUT search options */
  _getTransactionsAllRequest = (walletId: string): CachedRequest<GetTransactionsFunc> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  _getBalanceRequest = (walletId: string): CachedRequest<GetBalanceFunc> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.getBalanceRequest) return foundRequest.getBalanceRequest;
    return new CachedRequest<GetBalanceFunc>(this.api[environment.API].getBalance);
  };

}
