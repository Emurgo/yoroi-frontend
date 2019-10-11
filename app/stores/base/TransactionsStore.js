// @flow
import BigNumber from 'bignumber.js';
import { observable, computed, action, runInAction } from 'mobx';
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
  asGetAllAddresses,
  asGetBalance,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class TransactionsStore extends Store {

  /** How many transactions to display */
  INITIAL_SEARCH_LIMIT = 5;

  /** How many additonall transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE = 5;

  /** Skip first n transactions from api */
  SEARCH_SKIP = 0;

  /** Track transactions for a set of wallets */
  @observable transactionsRequests: Array<{
    publicDeriver: PublicDeriver,
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
      const publicDeriver = this.stores.substores[environment.API].wallets.selected;
      if (!publicDeriver) return;
      this.refreshTransactionData(publicDeriver);
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
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
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return null;
    let options = this._searchOptionsForWallets.get(publicDeriver);
    if (!options) {
      // Setup options for each requested wallet
      runInAction(() => {
        this._searchOptionsForWallets.set(
          publicDeriver,
          {
            limit: this.INITIAL_SEARCH_LIMIT,
            skip: this.SEARCH_SKIP
          }
        );
      });
      options = this._searchOptionsForWallets.get(publicDeriver);
    }
    return options;
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return [];
    const result = this._getTransactionsRecentRequest(publicDeriver.self).result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsRecentRequest(publicDeriver.self).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsPendingRequest(publicDeriver.self).result;
    if (result) {
      this._hasAnyPending = result.length > 0;
    }
    return this._hasAnyPending;
  }

  @computed get totalAvailable(): number {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return 0;
    const result = this._getTransactionsAllRequest(publicDeriver.self).result;
    return result ? result.transactions.length : 0;
  }

  /** Refresh transaction data for all wallets and update wallet balance */
  @action refreshTransactionData = (
    basePubDeriver: PublicDeriverWithCachedMeta,
  ): void => {
    const walletsStore = this.stores.substores[environment.API].wallets;
    const walletsActions = this.actions[environment.API].wallets;

    const publicDeriver = asGetAllAddresses(basePubDeriver.self);
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
    const allRequest = this._getTransactionsAllRequest(publicDeriver);
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: false,
      getTransactionsHistoryForAddresses,
      checkAddressesInUse,
      getBestBlock,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    allRequest.promise
      .then(async () => {
        // calculate pending tranactions just to cache the result
        const pendingRequest = this._getTransactionsPendingRequest(publicDeriver);
        pendingRequest.invalidate({ immediately: false });
        pendingRequest.execute(
          { publicDeriver }
        );

        const canGetBalance = asGetBalance(basePubDeriver.self);
        if (canGetBalance == null) {
          return new BigNumber(0);
        }
        const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate({
          getLastSyncInfo: publicDeriver.getLastSyncInfo
        });
        // Note: cache based on last slot synced  (not used in balanceRequest)
        const req = this._getBalanceRequest(publicDeriver);
        req.execute({
          slot: lastUpdateDate.SlotNum,
          getBalance: canGetBalance.getBalance,
        });
        if (!req.promise) throw new Error('should never happen');
        return req.promise;
      })
      .then((updatedBalance) => {
        if (
          walletsStore.selected &&
          walletsStore.selected.self === publicDeriver
        ) {
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
          publicDeriver,
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
        return undefined;
      })
      .catch(() => {}); // Do nothing. It's logged in the api call
  };

  /** Add a new public deriver to track and refresh the data */
  @action addObservedWallet = (
    publicDeriver: PublicDeriverWithCachedMeta
  ): void => {
    this.transactionsRequests.push({
      publicDeriver: publicDeriver.self,
      recentRequest: this._getTransactionsRecentRequest(publicDeriver.self),
      allRequest: this._getTransactionsAllRequest(publicDeriver.self),
      getBalanceRequest: this._getBalanceRequest(publicDeriver.self),
      pendingRequest: this._getTransactionsPendingRequest(publicDeriver.self),
    });
    this.refreshTransactionData(publicDeriver);
  }

  _getTransactionsPendingRequest = (
    publicDeriver: PublicDeriver
  ): CachedRequest<RefreshPendingTransactionsFunc> => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.pendingRequest) return foundRequest.pendingRequest;
    return new CachedRequest<RefreshPendingTransactionsFunc>(
      this.api[environment.API].refreshPendingTransactions
    );
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITH search options */
  _getTransactionsRecentRequest = (
    publicDeriver: PublicDeriver
  ): CachedRequest<GetTransactionsFunc> => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.recentRequest) return foundRequest.recentRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  /** Get request for fetching transaction data.
   * Should ONLY be executed to cache query WITHOUT search options */
  _getTransactionsAllRequest = (
    publicDeriver: PublicDeriver
  ): CachedRequest<GetTransactionsFunc> => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  _getBalanceRequest = (
    publicDeriver: PublicDeriver
  ): CachedRequest<GetBalanceFunc> => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.getBalanceRequest) return foundRequest.getBalanceRequest;
    return new CachedRequest<GetBalanceFunc>(this.api[environment.API].getBalance);
  };

}
