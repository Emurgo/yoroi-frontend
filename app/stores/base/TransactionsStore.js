// @flow
import { runInAction, observable, computed, action, } from 'mobx';
import { find } from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import WalletTransaction from '../../domain/WalletTransaction';

import type { GetTransactionsFunc, GetBalanceFunc,
  GetTransactionsRequest, GetTransactionsRequestOptions,
  RefreshPendingTransactionsFunc
} from '../../api/ada';
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
    // TODO: not only ADA
    const actions = this.actions[this.stores.profile.selectedAPI.type].transactions;
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

  @computed get lastSyncInfo(): IGetLastSyncInfoResponse {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.lastSyncInfo)} no wallet selected`);
    }
    const result = this.getTxRequests(publicDeriver).lastSyncInfo;
    return result;
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
    const API = this.stores.profile.selectedAPI.type;
    const stateFetcher = this.stores.substores[API].stateFetchStore.fetcher;
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

    const recentRequest = this.getTxRequests(request.publicDeriver).requests.recentRequest;
    const newHash = hashTransactions(result.transactions);

    // update last sync (note: changes even if no new transaction is found)
    {
      const lastUpdateDate = await this.api[
        this.stores.profile.selectedAPI.type
      ].getTxLastUpdatedDate({
        getLastSyncInfo: publicDeriver.getLastSyncInfo
      });
      runInAction(() => {
        this.getTxRequests(request.publicDeriver).lastSyncInfo = lastUpdateDate;
      });
    }

    // only recalculate cache if
    // 1) the tx history changed
    // 2) if it's the first time computing for this wallet
    if (oldHash !== newHash || !recentRequest.wasExecuted) {
      await this.reactToTxHistoryUpdate({ publicDeriver: request.publicDeriver });
    }

    // sync these regardless of whether or not new txs are found

    // note: possible existing memos were modified on a difference instance, etc.
    await this.actions.memos.syncTxMemos.trigger(request.publicDeriver);
    // note: possible we failed to get the historical price for something in the past
    await this.stores.coinPriceStore.updateTransactionPriceData({
      db: publicDeriver.getDb(),
      transactions: result.transactions,
    });
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
    const API = this.stores.profile.selectedAPI;
    const stateFetcher = this.stores.substores[API.type].stateFetchStore.fetcher;

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
    const api = this.api[this.stores.profile.selectedAPI.type];
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
