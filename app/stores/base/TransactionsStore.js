// @flow
import BigNumber from 'bignumber.js';
import { runInAction, observable, computed, action, } from 'mobx';
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
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';

export type TxRequests = {|
  publicDeriver: PublicDeriver<>,
  lastSyncInfo: IGetLastSyncInfoResponse,
  requests: {|
    pendingRequest: CachedRequest<RefreshPendingTransactionsFunc>,
    /**
    * Should ONLY be executed to cache query WITH search options
    */
    recentRequest: CachedRequest<GetTransactionsFunc>,
    /**
    * Should ONLY be executed to cache query WITHOUT search options
    */
    allRequest: CachedRequest<GetTransactionsFunc>,
    /**
     * in lovelaces
     */
    getBalanceRequest: CachedRequest<GetBalanceFunc>,
  |},
|};

export default class TransactionsStore extends Store {

  /** How many transactions to display */
  INITIAL_SEARCH_LIMIT: number = 5;

  /** How many additional transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE: number = 5;

  /** Skip first n transactions from api */
  SEARCH_SKIP: number = 0;

  /** Track transactions for a set of wallets */
  @observable transactionsRequests: Array<TxRequests> = [];

  @observable _searchOptionsForWallets: Array<{|
    publicDeriver: PublicDeriver<>,
    options: GetTransactionsRequestOptions,
  |}> = [];

  setup(): void {
    super.setup();
    const actions = this.actions[environment.API].transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
  }

  @action _increaseSearchLimit: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    if (this.searchOptions != null) {
      this.searchOptions.limit += this.SEARCH_LIMIT_INCREASE;
      await this.refreshLocal(publicDeriver);
    }
  };

  @computed get recentTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.recentTransactionsRequest)} no wallet selected`);
    }
    return this._getTransactionsRecentRequest(publicDeriver);
  }

  /** Get (or create) the search options for the active wallet (if any)  */
  @computed get searchOptions(): ?GetTransactionsRequestOptions {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return null;
    const foundSearchOptions = find(
      this._searchOptionsForWallets,
      { publicDeriver }
    );
    if (!foundSearchOptions) {
      throw new Error(`${nameof(this.searchOptions)} no option found`);
    }
    return foundSearchOptions.options;
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this._getTransactionsRecentRequest(publicDeriver).result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsRecentRequest(publicDeriver).result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this._getTransactionsPendingRequest(publicDeriver).result;
    return result ? result.length > 0 : false;
  }

  @computed get totalAvailable(): number {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return 0;
    const result = this.getTransactionsAllRequest(publicDeriver).result;
    return result ? result.transactions.length : 0;
  }

  /** Refresh transaction data for all wallets and update wallet balance */
  @action refreshTransactionData: {|
    publicDeriver: PublicDeriver<>,
    localRequest: boolean,
  |} => Promise<void> = async (request) => {
    const publicDeriver = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(request.publicDeriver);
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
    const allRequest = this.getTransactionsAllRequest(request.publicDeriver);
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: request.localRequest,
      getTransactionsHistoryForAddresses,
      checkAddressesInUse,
      getBestBlock,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    await allRequest.promise
      .then(async () => {
        // calculate pending transactions just to cache the result
        const pendingRequest = this._getTransactionsPendingRequest(request.publicDeriver);
        pendingRequest.invalidate({ immediately: false });
        pendingRequest.execute(
          { publicDeriver }
        );
        if (!pendingRequest.promise) throw new Error('should never happen');
        await pendingRequest.promise;

        const canGetBalance = asGetBalance(request.publicDeriver);
        if (canGetBalance == null) {
          return new BigNumber(0);
        }
        {
          const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate({
            getLastSyncInfo: publicDeriver.getLastSyncInfo
          });
          runInAction(() => {
            this.getTxRequests(request.publicDeriver).lastSyncInfo = lastUpdateDate;
          });
        }
        // Note: cache based on last slot synced (not used in balanceRequest)
        const req = this._getBalanceRequest(request.publicDeriver);
        req.execute({
          getBalance: canGetBalance.getBalance,
        });
        if (!req.promise) throw new Error('should never happen');
        return req.promise;
      })
      .then(() => {
        // Here we are sure that allRequest was resolved and the local database was updated
        return this.refreshLocal(request.publicDeriver);
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
      throw new Error(`${nameof(this.refreshLocal)} no levels`);
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
  @action addObservedWallet: {|
    publicDeriver: PublicDeriver<>,
    lastSyncInfo: IGetLastSyncInfoResponse,
  |} => void = (
    request
  ) => {
    this.transactionsRequests.push({
      publicDeriver: request.publicDeriver,
      lastSyncInfo: request.lastSyncInfo,
      requests: {
        recentRequest: this._getTransactionsRecentRequest(request.publicDeriver),
        allRequest: this.getTransactionsAllRequest(request.publicDeriver),
        getBalanceRequest: this._getBalanceRequest(request.publicDeriver),
        pendingRequest: this._getTransactionsPendingRequest(request.publicDeriver),
      },
    });
    this._searchOptionsForWallets.push({
      publicDeriver: request.publicDeriver,
      options: {
        limit: this.INITIAL_SEARCH_LIMIT,
        skip: this.SEARCH_SKIP
      }
    });
  }

  getTxRequests: (
    PublicDeriver<>
  ) => TxRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest == null) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.getTxRequests)} no requests found`);
    }
    return foundRequest;
  };

  // TODO: delete function and use getTxRequests
  _getTransactionsPendingRequest: (
    PublicDeriver<>
  ) => CachedRequest<RefreshPendingTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.requests.pendingRequest) {
      return foundRequest.requests.pendingRequest;
    }
    return new CachedRequest<RefreshPendingTransactionsFunc>(
      this.api[environment.API].refreshPendingTransactions
    );
  };

  // TODO: delete function and use getTxRequests
  _getTransactionsRecentRequest: PublicDeriver<> => CachedRequest<GetTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.requests.recentRequest) {
      return foundRequest.requests.recentRequest;
    }
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  // TODO: delete function and use getTxRequests
  getTransactionsAllRequest: PublicDeriver<> => CachedRequest<GetTransactionsFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.requests.allRequest) {
      return foundRequest.requests.allRequest;
    }
    return new CachedRequest<GetTransactionsFunc>(this.api[environment.API].refreshTransactions);
  };

  // TODO: delete function and use getTxRequests
  _getBalanceRequest: (PublicDeriver<>) => CachedRequest<GetBalanceFunc> = (
    publicDeriver
  ) => {
    const foundRequest = find(this.transactionsRequests, { publicDeriver });
    if (foundRequest && foundRequest.requests.getBalanceRequest) {
      return foundRequest.requests.getBalanceRequest;
    }
    return new CachedRequest<GetBalanceFunc>(this.api[environment.API].getBalance);
  };
}
