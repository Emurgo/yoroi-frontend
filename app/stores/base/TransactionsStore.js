// @flow
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
import { digetForHash } from '../../api/ada/lib/storage/database/primitives/api/utils';

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

/** How many transactions to display */
export const INITIAL_SEARCH_LIMIT: number = 5;

/** Skip first n transactions from api */
export const SEARCH_SKIP: number = 0;

export default class TransactionsStore extends Store {

  /** How many additional transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE: number = 5;

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
    return this.getTxRequests(publicDeriver).requests.recentRequest;
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


  /**
   * generate a hash of the transaction history
   * we can use this to trigger mobx updates
   */
  @computed get hash(): number {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return 0;
    const result = this.getTxRequests(publicDeriver).requests.allRequest.result;
    if (result == null) return 0;

    return hashTransactions(result.transactions);
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this.getTxRequests(publicDeriver).requests.recentRequest.result;
    return result ? result.transactions : [];
  }

  @computed get hasAny(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this.getTxRequests(publicDeriver).requests.recentRequest.result;
    return result ? result.transactions.length > 0 : false;
  }

  @computed get hasAnyPending(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this.getTxRequests(publicDeriver).requests.pendingRequest.result;
    return result ? result.length > 0 : false;
  }

  @computed get totalAvailable(): number {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return 0;
    const result = this.getTxRequests(publicDeriver).requests.allRequest.result;
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
    const allRequest = this.getTxRequests(request.publicDeriver).requests.allRequest;

    const oldHash = hashTransactions(allRequest.result?.transactions);
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: request.localRequest,
      getTransactionsHistoryForAddresses,
      checkAddressesInUse,
      getBestBlock,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    const result = await allRequest.promise;
    const newHash = hashTransactions(result.transactions);
    if (oldHash !== newHash) {
      this.reactToTxHistoryUpdate({ publicDeriver: request.publicDeriver });
    }
  };

  @action reactToTxHistoryUpdate: {|
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    const publicDeriver = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(request.publicDeriver);
    if (publicDeriver == null) {
      return;
    }
    // calculate pending transactions just to cache the result
    {
      const pendingRequest = this.getTxRequests(request.publicDeriver).requests.pendingRequest;
      pendingRequest.invalidate({ immediately: false });
      pendingRequest.execute(
        { publicDeriver }
      );
      if (!pendingRequest.promise) throw new Error('should never happen');
      await pendingRequest.promise;
    }

    // update last sync
    {
      const lastUpdateDate = await this.api[environment.API].getTxLastUpdatedDate({
        getLastSyncInfo: publicDeriver.getLastSyncInfo
      });
      runInAction(() => {
        this.getTxRequests(request.publicDeriver).lastSyncInfo = lastUpdateDate;
      });
    }

    // update balance
    await (async () => {
      const canGetBalance = asGetBalance(publicDeriver);
      if (canGetBalance == null) {
        return;
      }
      const balanceReq = this.getTxRequests(request.publicDeriver).requests.getBalanceRequest;
      balanceReq.invalidate({ immediately: false });
      balanceReq.execute({
        getBalance: canGetBalance.getBalance,
      });
      if (!balanceReq.promise) throw new Error('should never happen');
      await balanceReq.promise;
    })();

    // refresh local history
    await this.refreshLocal(request.publicDeriver);
  }

  @action refreshLocal: (
    PublicDeriver<> & IGetLastSyncInfo
  ) => Promise<PromisslessReturnType<GetTransactionsFunc>> = (
    publicDeriver: PublicDeriver<> & IGetLastSyncInfo,
  ) => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;

    const limit = this.searchOptions
      ? this.searchOptions.limit
      : INITIAL_SEARCH_LIMIT;
    const skip = this.searchOptions
      ? this.searchOptions.skip
      : SEARCH_SKIP;

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
    const recentRequest = this.getTxRequests(publicDeriver).requests.recentRequest;
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
    const foundRequest = find(this.transactionsRequests, { publicDeriver: request.publicDeriver });
    if (foundRequest != null) {
      return;
    }
    const api = this.api[environment.API];
    this.transactionsRequests.push({
      publicDeriver: request.publicDeriver,
      lastSyncInfo: request.lastSyncInfo,
      requests: {
        recentRequest: new CachedRequest<GetTransactionsFunc>(api.refreshTransactions),
        allRequest: new CachedRequest<GetTransactionsFunc>(api.refreshTransactions),
        getBalanceRequest: new CachedRequest<GetBalanceFunc>(api.getBalance),
        pendingRequest: new CachedRequest<RefreshPendingTransactionsFunc>(
          api.refreshPendingTransactions
        ),
      },
    });
    this._searchOptionsForWallets.push({
      publicDeriver: request.publicDeriver,
      options: {
        limit: INITIAL_SEARCH_LIMIT,
        skip: SEARCH_SKIP
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
}

function hashTransactions(transactions: ?Array<WalletTransaction>): number {
  let hash = 0;
  if (transactions == null) return hash;

  const seed = 858499202; // random seed
  for (const tx of transactions) {
    hash = digetForHash(hash.toString(16) + tx.uniqueKey, seed);
  }
  return hash;
}
