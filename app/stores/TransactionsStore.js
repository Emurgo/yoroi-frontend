// @flow
import { observable, computed, action, extendObservable } from 'mobx';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import Store from './lib/Store';
import CachedRequest from './lib/LocalizedCachedRequest';
import WalletTransaction from '../domain/WalletTransaction';
import type { GetTransactionsResponse, GetBalanceResponse } from '../api/common';
import environment from '../environment';

export type TransactionSearchOptionsStruct = {
  searchLimit: number,
  searchSkip: number,
};

export default class TransactionsStore extends Store {

  INITIAL_SEARCH_LIMIT = 5;
  SEARCH_LIMIT_INCREASE = 5;
  SEARCH_SKIP = 0;

  @observable transactionsRequests: Array<{
    walletId: string,
    pendingRequest: CachedRequest<GetTransactionsResponse>,
    recentRequest: CachedRequest<GetTransactionsResponse>,
    allRequest: CachedRequest<GetTransactionsResponse>,
    getBalanceRequest: CachedRequest<GetBalanceResponse>
  }> = [];

  @observable _searchOptionsForWallets = {};

  _hasAnyPending: boolean = false;

  setup() {
    const actions = this.actions[environment.API].transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
  }

  @action _increaseSearchLimit = () => {
    if (this.searchOptions != null) {
      this.searchOptions.searchLimit += this.SEARCH_LIMIT_INCREASE;
      this._refreshTransactionData();
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsResponse> {
    const wallet = this.stores[environment.API].wallets.active;
    // TODO: Do not return new request here
    if (!wallet) return new CachedRequest(this.api[environment.API].getTransactions);
    return this._getTransactionsRecentRequest(wallet.id);
  }

  @computed get searchOptions(): ?TransactionSearchOptionsStruct {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return null;
    let options = this._searchOptionsForWallets[wallet.id];
    if (!options) {
      // Setup options for each requested wallet
      extendObservable(this._searchOptionsForWallets, {
        [wallet.id]: {
          searchLimit: this.INITIAL_SEARCH_LIMIT,
          searchSkip: this.SEARCH_SKIP
        }
      });
      options = this._searchOptionsForWallets[wallet.id];
    }
    return options;
  }

  @computed get recent(): Array<WalletTransaction> {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return [];
    const result = this._getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this._getTransactionsRecentRequest(wallet.id).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this._getTransactionsPendingRequest(wallet.id).result;
    if (result) {
      this._hasAnyPending = result.length > 0;
    }
    return this._hasAnyPending;
  }

  @computed get totalAvailable(): number {
    const wallet = this.stores[environment.API].wallets.active;
    if (!wallet) return 0;
    const result = this._getTransactionsAllRequest(wallet.id).result;
    return result ? result.transactions.length : 0;
  }

  @action _refreshTransactionData = () => {
    const walletsStore = this.stores[environment.API].wallets;
    const walletsActions = this.actions[environment.API].wallets;
    const allWallets = walletsStore.all;
    for (const wallet of allWallets) {
      const searchLimit = this.searchOptions ?
        this.searchOptions.searchLimit : this.INITIAL_SEARCH_LIMIT;
      const requestParams = {
        walletId: wallet.id,
        limit: searchLimit,
        skip: 0,
      };
      const recentRequest = this._getTransactionsRecentRequest(wallet.id);
      recentRequest.invalidate({ immediately: false });
      recentRequest.execute(requestParams);
      const allRequest = this._getTransactionsAllRequest(wallet.id);
      allRequest.invalidate({ immediately: false });
      allRequest.execute({ walletId: wallet.id });
      allRequest.promise
        .then(async () => {
          const pendingRequest = this._getTransactionsPendingRequest(wallet.id);
          pendingRequest.invalidate({ immediately: false });
          pendingRequest.execute({ walletId: wallet.id });
          const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate();
          // Note: we cache based off lastUpdateDate even though it's not actually used in the balanceRequest call
          return this._getBalanceRequest(wallet.id).execute(lastUpdateDate);
        })
        .then((updatedBalance: BigNumber) => {
          if (walletsStore.active.id === wallet.id) {
            walletsActions.updateBalance.trigger(updatedBalance);
          }
          return undefined;
        })
        .catch(() => {}); // Do nothing. It's logged in the api call
    }
  };

  _getTransactionsPendingRequest = (walletId: string): CachedRequest<GetTransactionsResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.pendingRequest) return foundRequest.pendingRequest;
    return new CachedRequest(this.api[environment.API].refreshPendingTransactions);
  };

  _getTransactionsRecentRequest = (walletId: string): CachedRequest<GetTransactionsResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.recentRequest) return foundRequest.recentRequest;
    return new CachedRequest(this.api[environment.API].refreshTransactions);
  };

  _getTransactionsAllRequest = (walletId: string): CachedRequest<GetTransactionsResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest(this.api[environment.API].refreshTransactions);
  };

  _getBalanceRequest = (walletId: string): CachedRequest<GetBalanceResponse> => {
    const foundRequest = _.find(this.transactionsRequests, { walletId });
    if (foundRequest && foundRequest.getBalanceRequest) return foundRequest.getBalanceRequest;
    return new CachedRequest(this.api[environment.API].getBalance);
  };

}
