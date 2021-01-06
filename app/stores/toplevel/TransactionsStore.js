// @flow
import { runInAction, observable, computed, action, } from 'mobx';
import { find } from 'lodash';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import WalletTransaction, { calculateUnconfirmedAmount } from '../../domain/WalletTransaction';
import { getPriceKey } from '../../api/common/lib/storage/bridge/prices';
import type {
  GetBalanceFunc,
} from '../../api/common/types';
import type {
  GetTransactionsFunc,
  BaseGetTransactionsRequest, GetTransactionsRequestOptions,
  RefreshPendingTransactionsFunc,
  ExportTransactionsFunc,
} from '../../api/common/index';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetBalance, asHasLevels, asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetLastSyncInfo,
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import { digestForHash } from '../../api/ada/lib/storage/database/primitives/api/utils';
import { getApiForNetwork, } from '../../api/common/utils';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import type { TransactionRowsToExportRequest } from '../../actions/common/transactions-actions';
import globalMessages from '../../i18n/global-messages';
import * as timeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import { getCardanoHaskellBaseConfig, isCardanoHaskell, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { genLookupOrFail, getTokenName } from '../stateless/tokenHelpers';

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


const EXPORT_START_DELAY = 800; // in milliseconds [1000 = 1sec]

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

  getTransactionRowsToExportRequest: LocalizedRequest<(void => Promise<void>) => Promise<void>>
    = new LocalizedRequest<(void => Promise<void>) => Promise<void>>(func => func());
  exportTransactions: LocalizedRequest<ExportTransactionsFunc>
    = new LocalizedRequest<ExportTransactionsFunc>(this.api.export.exportTransactions);
  @observable isExporting: boolean = false;
  @observable exportError: ?LocalizableError;

  setup(): void {
    super.setup();
    const actions = this.actions.transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
    actions.exportTransactionsToFile.listen(this._exportTransactionsToFile);
    actions.closeExportTransactionDialog.listen(this._closeExportTransactionDialog);
  }

  /** Calculate information about transactions that are still realistically reversible */
  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const selectedNetwork = this.stores.profile.selectedNetwork;
    if (selectedNetwork == null) throw new Error(`${nameof(this.unconfirmedAmount)} no network selected`);

    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(selectedNetwork.NetworkId);
    const defaultTokenInfo = {
      defaultNetworkId: defaultToken.NetworkId,
      defaultIdentifier: defaultToken.Identifier,
    };

    const defaultUnconfirmedAmount = {
      total: new MultiToken([], defaultTokenInfo),
      incoming: new MultiToken([], defaultTokenInfo),
      outgoing: new MultiToken([], defaultTokenInfo),
      incomingInSelectedCurrency: new BigNumber(0),
      outgoingInSelectedCurrency: new BigNumber(0),
    };

    // Get current public deriver
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return defaultUnconfirmedAmount;

    // Get current transactions for public deriver
    const txRequests = this.getTxRequests(publicDeriver);
    const result = txRequests.requests.allRequest.result;
    if (!result || !result.transactions) return defaultUnconfirmedAmount;

    const unitOfAccount = this.stores.profile.unitOfAccount;

    const { assuranceMode } = this.stores.walletSettings
      .getPublicDeriverSettingsCache(publicDeriver);


    const getUnitOfAccount = (timestamp: Date) => (!unitOfAccount.enabled
      ? undefined
      : this.stores.coinPriceStore.priceMap.get(getPriceKey(
        getTokenName(this.stores.tokenInfoStore.getDefaultTokenInfo(
          publicDeriver.getParent().getNetworkInfo().NetworkId
        )),
        unitOfAccount.currency,
        timestamp
      )));
    return calculateUnconfirmedAmount(
      result.transactions,
      txRequests.lastSyncInfo.Height,
      assuranceMode,
      getUnitOfAccount,
      defaultTokenInfo,
    );
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
    const allRequest = this.getTxRequests(request.publicDeriver).requests.allRequest;

    const oldHash = hashTransactions(allRequest.result?.transactions);
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: request.localRequest,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    const result = await allRequest.promise;

    const recentRequest = this.getTxRequests(request.publicDeriver).requests.recentRequest;
    const newHash = hashTransactions(result.transactions);

    // update last sync (note: changes even if no new transaction is found)
    {
      const lastUpdateDate = await this.api.common.getTxLastUpdatedDate({
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

    // update token info cache
    await this.stores.tokenInfoStore.refreshTokenInfo();

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
    const requestParams: BaseGetTransactionsRequest = {
      publicDeriver: withLevels,
      isLocalRequest: true,
      limit,
      skip,
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
    const apiType = getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo());

    const foundRequest = find(
      this.transactionsRequests,
      { publicDeriver: request.publicDeriver }
    );
    if (foundRequest != null) {
      return;
    }
    this.transactionsRequests.push({
      publicDeriver: request.publicDeriver,
      lastSyncInfo: request.lastSyncInfo,
      requests: {
        // note: this captures the right API for the wallet
        recentRequest: new CachedRequest<GetTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshTransactions
        ),
        allRequest: new CachedRequest<GetTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshTransactions
        ),
        getBalanceRequest: new CachedRequest<GetBalanceFunc>(this.api.common.getBalance),
        pendingRequest: new CachedRequest<RefreshPendingTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshPendingTransactions
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

  @action _exportTransactionsToFile: {|
    publicDeriver: PublicDeriver<>,
    exportRequest: TransactionRowsToExportRequest,
  |} => Promise<void> = async (request) => {
    try {
      this._setExporting(true);

      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();

      const continuation = await this.exportTransactionsToFile({
        publicDeriver: request.publicDeriver,
        exportRequest: request.exportRequest,
      });



      /** Intentionally added delay to feel smooth flow */
      setTimeout(async () => {
        await continuation();
        this._setExporting(false);
        this.actions.dialogs.closeActiveDialog.trigger();
      }, EXPORT_START_DELAY);

    } catch (error) {
      let localizableError = error;
      if (!(error instanceof LocalizableError)) {
        localizableError = new UnexpectedError();
      }

      this._setExportError(localizableError);
      this._setExporting(false);
      Logger.error(`${nameof(TransactionsStore)}::${nameof(this._exportTransactionsToFile)} ${stringifyError(error)}`);
    } finally {
      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();
    }
  }

  @action _setExporting: boolean => void = (isExporting)  => {
    this.isExporting = isExporting;
  }

  @action _setExportError: ?LocalizableError => void = (error) => {
    this.exportError = error;
  }

  @action _closeExportTransactionDialog: void => void = () => {
    if (!this.isExporting) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._setExporting(false);
      this._setExportError(null);
    }
  }

  exportTransactionsToFile: {|
    publicDeriver: PublicDeriver<ConceptualWallet>,
    exportRequest: TransactionRowsToExportRequest,
  |} => Promise<void => Promise<void>> = async (request) => {
    const txStore = this.stores.transactions;
    let respTxRows = [];

    const apiType = getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo());
    const delegationStore = this.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(request.publicDeriver);

    await txStore.getTransactionRowsToExportRequest.execute(async () => {
      const selectedNetwork = request.publicDeriver.getParent().getNetworkInfo();
      const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
      if (!withLevels) return;
      const rows = await this.api[apiType].getTransactionRowsToExport({
        publicDeriver: withLevels,
        ...request.exportRequest,
        getDefaultToken: networkId => this.stores.tokenInfoStore.getDefaultTokenInfo(networkId),
      });

      /**
       * NOTE: The rewards export currently supports only Haskell Shelley
       */
      if (isCardanoHaskell(selectedNetwork) && delegationRequests) {
        const rewards = await delegationRequests.rewardHistory.promise;
        if (rewards != null) {
          const fullConfig = getCardanoHaskellBaseConfig(selectedNetwork);

          const absSlotFunc = await timeUtils.genToAbsoluteSlotNumber(fullConfig);
          const timeSinceGenFunc = await timeUtils.genTimeSinceGenesis(fullConfig);
          const realTimeFunc = await timeUtils.genToRealTime(fullConfig);
          const rewardRows = rewards.map(item => {
            const absSlot = absSlotFunc({
              epoch: item[0],
              slot: 0
            });
            const epochStartDate = realTimeFunc({
              absoluteSlotNum: absSlot,
              timeSinceGenesisFunc: timeSinceGenFunc
            });

            const defaultInfo = item[1].getDefaultEntry();
            const tokenInfo = this.stores.tokenInfoStore.tokenInfo
              .get(selectedNetwork.NetworkId.toString())
              ?.get(defaultInfo.identifier)
            return {
              type: 'in',
              amount: defaultInfo.amount.div(tokenInfo?.Metadata.numberOfDecimals || 0).toString(),
              fee: '0',
              date: epochStartDate,
              comment: `Staking Reward Epoch ${item[0]}`
            };
          });
          respTxRows.push(...rewardRows);
        }
      }

      respTxRows.push(...rows);
    }).promise;

    respTxRows = respTxRows.sort((a, b) => {
      return b.date - a.date;
    });

    if (respTxRows.length < 1) {
      throw new LocalizableError(globalMessages.noTransactionsFound);
    }

    const withPubKey = asGetPublicKey(request.publicDeriver);
    const plate = withPubKey == null
      ? null
      : this.stores.wallets.getPublicKeyCache(withPubKey).plate.TextPart;

    return async () => {
      const defaultToken = request.publicDeriver.getParent().getDefaultToken();
      const defaultTokenInfo = genLookupOrFail(this.stores.tokenInfoStore.tokenInfo)({
        identifier: defaultToken.defaultIdentifier,
        networkId: defaultToken.defaultNetworkId,
      });
      const tokenName = getTokenName(defaultTokenInfo);
      await this.stores.transactions.exportTransactions.execute({
        ticker: tokenName,
        rows: respTxRows,
        nameSuffix: plate == null
          ? tokenName
          : `${tokenName}-${plate}`,
      }).promise;
    };
  }
}

function hashTransactions(transactions: ?Array<WalletTransaction>): number {
  let hash = 0;
  if (transactions == null) return hash;

  const seed = 858499202; // random seed
  for (const tx of transactions) {
    hash = digestForHash(hash.toString(16) + tx.uniqueKey, seed);
  }
  return hash;
}
