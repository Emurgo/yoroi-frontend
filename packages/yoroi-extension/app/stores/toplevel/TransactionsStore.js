// @flow
import { action, computed, observable, runInAction, } from 'mobx';
import { find } from 'lodash';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import WalletTransaction from '../../domain/WalletTransaction';
import type { GetBalanceFunc, } from '../../api/common/types';
import type {
  BaseGetTransactionsRequest,
  ExportTransactionsFunc,
  GetTransactionsFunc,
  GetTransactionsDataFunc,
  GetTransactionsRequestOptions,
  RefreshPendingTransactionsFunc,
} from '../../api/common/index';
import { PublicDeriver, } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asGetPublicKey,
  asHasLevels,
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
import { Logger, stringifyError } from '../../utils/logging';
import type { TransactionRowsToExportRequest } from '../../actions/common/transactions-actions';
import globalMessages from '../../i18n/global-messages';
import * as timeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  isErgo,
  networks,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { MultiToken, } from '../../api/common/lib/MultiToken';
import type { DefaultTokenEntry, TokenEntry, } from '../../api/common/lib/MultiToken';
import { genLookupOrFail, getTokenName } from '../stateless/tokenHelpers';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { asAddressedUtxo, cardanoValueFromRemoteFormat } from '../../api/ada/transactions/utils';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../../api/ada/lib/storage/database/primitives/enums';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { CardanoAddressedUtxo } from '../../api/ada/transactions/types';
import type { AssuranceMode } from '../../types/transactionAssuranceTypes';
import {
  persistSubmittedTransactions,
  loadSubmittedTransactions
} from '../../api/localStorage';
import { assuranceLevels } from '../../config/transactionAssuranceConfig';
import { transactionTypes } from '../../api/ada/transactions/types';
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Todo: should be removed
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

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
    * Should ONLY be executed to cache query WITHOUT search options.
    * To reduce memory footprint, this request does not store the whole transaction
    *  list, but instead only derived data from it.
    *
    */
    allRequest: CachedRequest<GetTransactionsDataFunc>,
    /**
     * in lovelaces
     */
    getBalanceRequest: CachedRequest<GetBalanceFunc>,
    /**
     * in lovelaces
     */
    getAssetDepositRequest: CachedRequest<GetBalanceFunc>,
  |},
|};


const EXPORT_START_DELAY = 800; // in milliseconds [1000 = 1sec]

/** How many transactions to display */
export const INITIAL_SEARCH_LIMIT: number = 5;

/** Skip first n transactions from api */
export const SEARCH_SKIP: number = 0;

type SubmittedTransactionEntry = {|
  networkId: number,
  publicDeriverId: number,
  transaction: WalletTransaction,
  usedUtxos: Array<{| txHash: string, index: number |}>,
|};

function getCoinsPerUtxoWord(network: $ReadOnly<NetworkRow>): RustModule.WalletV4.BigNum {
  const config = getCardanoHaskellBaseConfig(network)
    .reduce((acc, next) => Object.assign(acc, next), {});
  return RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord);
}

function newMultiToken(
  defaultTokenInfo: DefaultTokenEntry,
  values: Array<TokenEntry> = [],
): MultiToken {
  return new MultiToken(values, defaultTokenInfo)
}

const TRANSACTION_LIST_COMPUTATION_BATCH_SIZE = 60;

export default class TransactionsStore extends Store<StoresMap, ActionsMap> {

  /** How many additional transactions to display when user wants to show more */
  SEARCH_LIMIT_INCREASE: number = 5;

  /** Track transactions for a set of wallets */
  @observable transactionsRequests: Array<TxRequests> = [];

  /** Track banners open status */
  @observable showWalletEmptyBanner: boolean = true;
  @observable showDelegationBanner: boolean = true;

  @observable _searchOptionsForWallets: Array<{|
    publicDeriver: PublicDeriver<>,
    options: GetTransactionsRequestOptions,
  |}> = [];

  @observable _submittedTransactions: Array<SubmittedTransactionEntry> = [];

  getTransactionRowsToExportRequest: LocalizedRequest<(void => Promise<void>) => Promise<void>>
    = new LocalizedRequest<(void => Promise<void>) => Promise<void>>(func => func());
  exportTransactions: LocalizedRequest<ExportTransactionsFunc>
    = new LocalizedRequest<ExportTransactionsFunc>(this.api.export.exportTransactions);
  @observable isExporting: boolean = false;
  @observable exportError: ?LocalizableError;
  @observable shouldIncludeTxIds: boolean = false;

  ongoingRefreshing: Map<number, Promise<void>> = observable.map({});

  setup(): void {
    super.setup();
    const actions = this.actions.transactions;
    actions.loadMoreTransactions.listen(this._increaseSearchLimit);
    actions.exportTransactionsToFile.listen(this._exportTransactionsToFile);
    actions.closeExportTransactionDialog.listen(this._closeExportTransactionDialog);
    actions.closeWalletEmptyBanner.listen(this._closeWalletEmptyBanner);
    actions.closeDelegationBanner.listen(this._closeDelegationBanner);
    this._loadSubmittedTransactions();
    window.chrome.runtime.onMessage.addListener((message) => {
      if (message === 'connector-tx-submitted') {
        runInAction(this._loadSubmittedTransactions);
      }
    });
  }

  /** Calculate information about transactions that are still realistically reversible */
  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const defaultUnconfirmedAmount = {
      incoming: [],
      outgoing: [],
    };

    // Get current public deriver
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return defaultUnconfirmedAmount;

    // Get current transactions for public deriver
    const txRequests = this.getTxRequests(publicDeriver);
    const result = txRequests.requests.allRequest.result;
    if (!result || !result.unconfirmedAmount) return defaultUnconfirmedAmount;

    return result.unconfirmedAmount;
  }


  @action _increaseSearchLimit: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    if (this.searchOptions != null) {
      this.searchOptions.limit += this.SEARCH_LIMIT_INCREASE;
      await this.refreshLocal(publicDeriver);
    }
  };

  @action toggleIncludeTxIds: void => void = () => {
    this.shouldIncludeTxIds = !this.shouldIncludeTxIds
  }

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

    return result.hash;
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this.getTxRequests(publicDeriver).requests.recentRequest.result;
    return  [
      ...this.getSubmittedTransactions(publicDeriver),
      ...(result ? result.transactions : [])
    ];
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
    return result ? result.totalAvailable : 0;
  }

  // This method ensures that at any time, there is only one refreshing process
  // for each wallet.
  refreshTransactionData: {|
    publicDeriver: PublicDeriver<>,
    localRequest: boolean,
  |} => Promise<void> = async (request) => {
    const { publicDeriverId } = request.publicDeriver;
    if (this.ongoingRefreshing.has(publicDeriverId)) {
      return this.ongoingRefreshing.get(publicDeriverId);
    }
    try {
      const promise = this._refreshTransactionData(request);
      runInAction(() => {
        this.ongoingRefreshing.set(publicDeriverId, promise);
      });
      await promise;
    } finally {
      runInAction(() => {
        this.ongoingRefreshing.delete(publicDeriverId);
      });
    }
  }

  isWalletRefreshing:  PublicDeriver<> => boolean = (publicDeriver) => {
    return this.ongoingRefreshing.has(publicDeriver.publicDeriverId)
  }

  isWalletLoading:  PublicDeriver<> => boolean = (publicDeriver) => {
    return !this.getTxRequests(publicDeriver).requests.recentRequest.wasExecuted;
  }

  /** Refresh transaction data for all wallets and update wallet balance */
  @action _refreshTransactionData: {|
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

    const oldHash = allRequest.result ? allRequest.result.hash : 0;
    allRequest.invalidate({ immediately: false });
    allRequest.execute({
      publicDeriver,
      isLocalRequest: request.localRequest,
    });

    if (!allRequest.promise) throw new Error('should never happen');

    const result = await allRequest.promise;

    const recentRequest = this.getTxRequests(request.publicDeriver).requests.recentRequest;
    const newHash = result.hash;

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

    const defaultTokenInfo = this.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );
    const ticker = defaultTokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected default token type');
    }
    await this.stores.coinPriceStore.updateTransactionPriceData({
      db: publicDeriver.getDb(),
      timestamps: result.timestamps,
      defaultToken: ticker,
    });

    const remoteTransactionIds = result.remoteTransactionIds;

    let submittedTransactionsChanged = false;
    runInAction(() => {
      for (let i = 0; i < this._submittedTransactions.length;) {
        if (remoteTransactionIds.has(this._submittedTransactions[i].transaction.txid)) {
          this._submittedTransactions.splice(i, 1);
          submittedTransactionsChanged = true;
        } else {
          i++;
        }
      }
    });
    if (submittedTransactionsChanged) {
      this._persistSubmittedTransactions();
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

    // update token info cache
    await this.stores.tokenInfoStore.refreshTokenInfo();

    const deriverParent = request.publicDeriver.getParent();
    const networkInfo = deriverParent.getNetworkInfo();
    const defaultToken = deriverParent.getDefaultToken();
    const isCardano = isCardanoHaskell(networkInfo);
    const coinsPerUtxoWord = isCardano ?
      getCoinsPerUtxoWord(networkInfo)
      : RustModule.WalletV4.BigNum.zero();

    // <TODO:PLUTUS_SUPPORT>
    const utxoHasDataHash = false;

    // calculate pending transactions just to cache the result
    const requests = this.getTxRequests(request.publicDeriver).requests;
    {
      const { pendingRequest } = requests;
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
      const { getBalanceRequest, getAssetDepositRequest } = requests;
      getBalanceRequest.invalidate({ immediately: false });
      getAssetDepositRequest.invalidate({ immediately: false });
      getBalanceRequest.execute({
        getBalance: canGetBalance.getBalance,
      });
      getAssetDepositRequest.execute({
        getBalance: async (): Promise<MultiToken> => {
          try {
            const canGetUtxos = asGetAllUtxos(publicDeriver);
            if (!isCardano || canGetUtxos == null) {
              return newMultiToken(defaultToken);
            }
            const WalletV4 = RustModule.WalletV4;
            const utxos = await canGetUtxos.getAllUtxos();
            const addressedUtxos = asAddressedUtxo(utxos)
              .filter(u => u.assets.length > 0);
            const deposits: Array<RustModule.WalletV4.BigNum> =
              addressedUtxos.map((u: CardanoAddressedUtxo) => {
                try {
                  return WalletV4.min_ada_required(
                    // $FlowFixMe[prop-missing]
                    cardanoValueFromRemoteFormat(u),
                    utxoHasDataHash,
                    coinsPerUtxoWord,
                  );
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error(`Failed to calculate min-required ADA for utxo: ${JSON.stringify(u)}`, e);
                  return WalletV4.BigNum.zero();
                }
              });
            const sumDeposit = deposits.reduce(
              (a, b) => a.checked_add(b),
              WalletV4.BigNum.zero(),
            );
            return newMultiToken(
              defaultToken,
              [{
                identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
                amount: new BigNumber(sumDeposit.to_str()),
                networkId: networkInfo.NetworkId,
              }],
            );
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to request asset deposit recalc', e);
          }
          return newMultiToken(defaultToken);
        },
      });
      if (!getBalanceRequest.promise || !getAssetDepositRequest.promise) throw new Error('should never happen');
      await Promise.all([getBalanceRequest.promise, getAssetDepositRequest.promise]);
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
        allRequest: new CachedRequest<GetTransactionsDataFunc>(
          this.genComputeOnAllTransactions(apiType),
        ),
        getBalanceRequest: new CachedRequest<GetBalanceFunc>(this.api.common.getBalance),
        getAssetDepositRequest: new CachedRequest<GetBalanceFunc>(this.api.common.getAssetDeposit),
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

  genComputeOnAllTransactions: string => GetTransactionsDataFunc = (apiType) => {
    return async (request) => {
      const publicDeriver = request.publicDeriver;

      // Get current transactions for public deriver
      const txRequests = this.getTxRequests((publicDeriver: any));

      const { assuranceMode } = this.stores.walletSettings
            .getPublicDeriverSettingsCache((publicDeriver: any));

      let cursor = 0;

      const reducers = [
        new HashReducer(),
        new TotalAvailableReducer(),
        new UnconfirmedAmountReducer(
          txRequests.lastSyncInfo.Height,
          assuranceMode,
        ),
        new RemoteTransactionIdsReducer(),
        new TimestampsReducer(),
        new AssetIdsReducer(),
      ];

      for (let i = 0; ; i++) {
        const batchRequest = {
          ...request,
          skip: cursor,
          limit: TRANSACTION_LIST_COMPUTATION_BATCH_SIZE,
        };

        const batchResult =
          await this.stores.substores[apiType].transactions.refreshTransactions(
            {
              ...batchRequest,
              // only the first call should update from remote
              isLocalRequest: i > 0,
            }
          );
        if (batchResult.transactions.length === 0) {
          break;
        }
        cursor += TRANSACTION_LIST_COMPUTATION_BATCH_SIZE;

        for (const reducer of reducers) {
          reducer.reduce(batchResult.transactions);
        }
      }

      return {
        hash: reducers[0].result,
        totalAvailable: reducers[1].result,
        unconfirmedAmount: reducers[2].result,
        remoteTransactionIds: reducers[3].result,
        timestamps: reducers[4].result,
        assetIds: [...reducers[5].result],
      };
    };
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

      const continuation = await this.exportTransactionsToFile(request);

      /** Intentionally added delay to feel smooth flow */
      setTimeout(async () => {
        await continuation();
        this._setExporting(false);
        this.actions.dialogs.closeActiveDialog.trigger();
        runInAction(() => {
          this.shouldIncludeTxIds = false
        })
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

  @action _closeWalletEmptyBanner: void => void = () => {
    this.showWalletEmptyBanner = false
  }
  @action _closeDelegationBanner: void => void = () => {
    this.showDelegationBanner = false
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
            const divider = new BigNumber(10).pow(tokenInfo?.Metadata.numberOfDecimals || 0);
            return {
              type: 'in',
              amount: defaultInfo.amount.div(divider).toString(),
              fee: '0',
              date: epochStartDate,
              comment: `Staking Reward Epoch ${item[0]}`,
              id: ''
            };
          });
          respTxRows.push(...rewardRows);
        }
      }

      respTxRows.push(...rows);
    }).promise;

    const { startDate, endDate } = request.exportRequest;
    if (startDate || endDate) {
      const dateFormat = 'MM-DD-YYYY'
      respTxRows = respTxRows.filter(row => {
        const txDate = dayjs(row.date).format(dateFormat)
        if (
          (startDate !== null && startDate.isAfter(txDate, 'day')) ||
          (endDate !== null && endDate.isBefore(txDate, 'day'))
        ) return false;
        return true
      })
    }
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
        shouldIncludeTxIds: this.shouldIncludeTxIds,
      }).promise;
    };
  }

  @action
  recordSubmittedTransaction: (
    PublicDeriver<>,
    WalletTransaction,
    Array<{| txHash: string, index: number |}>,
  ) => void = (
    publicDeriver,
    transaction,
    usedUtxos,
  ) => {
    this._submittedTransactions.push({
      publicDeriverId: publicDeriver.publicDeriverId,
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      transaction,
      usedUtxos,
    });
    this._persistSubmittedTransactions();
  }

  getSubmittedTransactions: (
    PublicDeriver<>,
  ) => Array<WalletTransaction> = (
    publicDeriver
  ) => {
    return this._submittedTransactions.filter(({ publicDeriverId }) =>
      publicDeriverId === publicDeriver.publicDeriverId
    ).map(tx => tx.transaction);
  }

  @action
  clearSubmittedTransactions: (
    PublicDeriver<>,
  ) => void = (
    publicDeriver
  ) => {
    for (let i = 0; i < this._submittedTransactions.length;) {
      if (
        this._submittedTransactions[i].publicDeriverId ===
          publicDeriver.publicDeriverId
      ) {
        this._submittedTransactions.splice(i, 1);
      } else {
        i++;
      }
    }
    this._persistSubmittedTransactions();
  }

  _persistSubmittedTransactions: () => void = () => {
    persistSubmittedTransactions(this._submittedTransactions);
  }

  _loadSubmittedTransactions: () => Promise<void> = async () => {
    try {
      const data = loadSubmittedTransactions();
      if (!data) {
        return;
      }
      // token id set in submitted transactions, grouped by the network id
      const tokenIds: Map<number, Set<string>> = new Map();
      const txs = data.map(({ publicDeriverId, transaction, networkId }) => {
        if (transaction.block) {
          throw new Error('submitted transaction should not have block data');
        }
        const txCtorData = {
          txid: transaction.txid,
          block: null,
          type: transaction.type,
          amount: MultiToken.from(transaction.amount),
          fee: MultiToken.from(transaction.fee),
          date: new Date(transaction.date),
          addresses: {
            from: transaction.addresses.from.map(({ address, value }) => ({
              address,
              value: MultiToken.from(value)
            })),
            to: transaction.addresses.to.map(({ address, value }) => ({
              address,
              value: MultiToken.from(value)
            })),
          },
          state: transaction.state,
          errorMsg: transaction.errorMsg,
        };
        let tx;

        const network: ?NetworkRow = (Object.values(networks): Array<any>).find(
          ({ NetworkId }) => NetworkId === networkId
        );
        if (!network) {
          return;
        }

        if (isCardanoHaskell(network)) {
          tx = new CardanoShelleyTransaction({
            ...txCtorData,
            certificates: transaction.certificates,
            ttl: new BigNumber(transaction.ttl),
            metadata: transaction.metadata,
            withdrawals: transaction.withdrawals.map(({ address, value }) => ({
              address,
              value: MultiToken.from(value)
            })),
            isValid: transaction.isValid,
          });
        } else if (isErgo(network)) {
          tx = new WalletTransaction(txCtorData);
        } else {
          return;
        }

        let tokenIdSet = tokenIds.get(networkId);
        if (!tokenIdSet) {
          tokenIdSet = new Set();
          tokenIds.set(networkId, tokenIdSet);
        }

        tx.addresses.from.flatMap(
          ({ value }) => value.values.map(tokenEntry => tokenEntry.identifier)
        ).forEach(tokenId => tokenIdSet?.add(tokenId));
        tx.addresses.to.flatMap(
          ({ value }) => value.values.map(tokenEntry => tokenEntry.identifier)
        ).forEach(tokenId => tokenIdSet?.add(tokenId));

        return {
          publicDeriverId,
          transaction: tx,
          networkId,
        };
      }).filter(Boolean);

      for (const [networkId, tokenIdSet] of tokenIds.entries()) {
        await this.stores.tokenInfoStore.fetchMissingTokenInfo(
          networkId,
          [...tokenIdSet]
        );
      }

      runInAction(() => {
        this._submittedTransactions.splice(0, 0, ...txs);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}

class HashReducer {
  hash: number = 0;
  reduce(transactions: Array<WalletTransaction>): void {
    const seed = 858499202; // random seed
    for (const tx of transactions) {
      this.hash = digestForHash(this.hash.toString(16) + tx.uniqueKey, seed);
    }
  }
  get result(): number {
    return this.hash;
  }
}

class TotalAvailableReducer {
  length: number = 0;
  reduce(transactions: Array<WalletTransaction>): void {
    this.length += transactions.length;
  }
  get result(): number {
    return this.length;
  }
}

class UnconfirmedAmountReducer {
  amount: UnconfirmedAmount;
  lastSyncHeight: number;
  assuranceMode: AssuranceMode;

  constructor(
    lastSyncHeight: number,
    assuranceMode: AssuranceMode,
  ) {
    this.amount = {
      incoming: [],
      outgoing: [],
    };

    this.lastSyncHeight = lastSyncHeight;
    this.assuranceMode = assuranceMode;
  }

  reduce(transactions: Array<WalletTransaction>): void {
    for (const transaction of transactions) {
      // skip any failed transactions
      if (transaction.state < 0) continue;

      const assuranceForTx = transaction.getAssuranceLevelForMode(
        this.assuranceMode,
        this.lastSyncHeight
      );

      if (assuranceForTx !== assuranceLevels.HIGH) {
        // outgoing
        if (transaction.type === transactionTypes.EXPEND) {
          this.amount.outgoing.push({
            amount: transaction.amount.absCopy(),
            timestamp: transaction.date.valueOf(),
          });
        }

        // incoming
        if (transaction.type === transactionTypes.INCOME) {
          this.amount.incoming.push({
            amount: transaction.amount.absCopy(),
            timestamp: transaction.date.valueOf(),
          });
        }
      }
    }
  }
  get result(): UnconfirmedAmount {
    return this.amount;
  }
}

class RemoteTransactionIdsReducer {
  ids: Set<string> = new Set();
  reduce(transactions: Array<WalletTransaction>): void {
    for (const { txid } of transactions) {
      this.ids.add(txid);
    }
  }
  get result(): Set<string> {
    return this.ids;
  }
}

class TimestampsReducer {
  timestamps: Set<number> = new Set();
  reduce(transactions: Array<WalletTransaction>): void {
    for (const { date } of transactions) {
      this.timestamps.add(date.valueOf());
    }
  }
  get result(): Array<number> {
    return Array.from(this.timestamps);
  }
}

// Collect all asset IDs that appear in the transaction list
class AssetIdsReducer {
  assetIds: Set<string> = new Set();
  reduce(transactions: Array<WalletTransaction>): void {
    for (const tx of transactions) {
      for (const io of tx.addresses.from) {
        for (const tokenEntry of io.value.values) {
          this.assetIds.add(tokenEntry.identifier);
        }
      }
      for (const io of tx.addresses.to) {
        for (const tokenEntry of io.value.values) {
          this.assetIds.add(tokenEntry.identifier);
        }
      }
    }
  }
  get result(): Set<string> {
    return this.assetIds;
  }
}
