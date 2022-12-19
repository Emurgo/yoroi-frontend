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
import { FETCH_TXS_BATCH_SIZE } from '../../api/ada';

export type TxHistoryState = {|
  publicDeriver: PublicDeriver<>,
  lastSyncInfo: IGetLastSyncInfoResponse,
  txs: Array<WalletTransaction>,
  hasMoreToLoad: boolean,
  requests: {|
    pendingRequest: CachedRequest<RefreshPendingTransactionsFunc>,
    // used to initially load the saved txs and then periodically refresh for
    // new txs
    headRequest: CachedRequest<GetTransactionsFunc>,
    // used to "load more transactions"
    tailRequest: CachedRequest<GetTransactionsFunc>,
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

export default class TransactionsStore extends Store<StoresMap, ActionsMap> {

  /** Track transactions for a set of wallets */
  @observable txHistoryStates: Array<TxHistoryState> = [];

  /** Track banners open status */
  @observable showWalletEmptyBanner: boolean = true;
  @observable showDelegationBanner: boolean = true;

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
    actions.loadMoreTransactions.listen(this._loadMore);
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
    return defaultUnconfirmedAmount;
  }

  @action toggleIncludeTxIds: void => void = () => {
    this.shouldIncludeTxIds = !this.shouldIncludeTxIds
  }

  @computed get headTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.headTransactionsRequest)} no wallet selected`);
    }
    return this.getTxHistoryState(publicDeriver).requests.headRequest;
  }

  @computed get tailTransactionsRequest(): CachedRequest<GetTransactionsFunc> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.tailTransactionsRequest)} no wallet selected`);
    }
    return this.getTxHistoryState(publicDeriver).requests.tailRequest;
  }

  @computed get lastSyncInfo(): IGetLastSyncInfoResponse {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.lastSyncInfo)} no wallet selected`);
    }
    const result = this.getTxHistoryState(publicDeriver).lastSyncInfo;
    return result;
  }

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const { txs } = this.getTxHistoryState(publicDeriver);
    return  [
      ...this.getSubmittedTransactions(publicDeriver),
      ...txs,
    ];
  }

  @computed get hasAny(): boolean {
    return this.recent.length > 0;
  }

  @computed get hasAnyPending(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const result = this.getTxHistoryState(publicDeriver).requests.pendingRequest.result;
    return result ? result.length > 0 : false;
  }

  @computed get hasMoreToLoad(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    return this.getTxHistoryState(publicDeriver).hasMoreToLoad;
  }

  // This method ensures that at any time, there is only one refreshing process
  // for each wallet.
  refreshTransactionData: {|
    publicDeriver: PublicDeriver<>,
    isLocalRequest: boolean,
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

  @computed get balance(): MultiToken | null {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return null;
    return this.getTxHistoryState(publicDeriver).requests.getBalanceRequest.result || null;
  }

  @computed get isLoadingMore(): boolean {
    const request = this.tailTransactionsRequest;
    return request.isExecuting;
  }

  @computed get isLoading(): boolean {
    const request = this.headTransactionsRequest;
    return !request.wasExecuted;
  }

  @computed get assetDeposit(): MultiToken | null {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return null;
    return this.getTxHistoryState(publicDeriver).requests.getAssetDepositRequest.result || null;
  }

  isWalletRefreshing:  PublicDeriver<> => boolean = (publicDeriver) => {
    return this.ongoingRefreshing.has(publicDeriver.publicDeriverId)
  }

  isWalletLoading:  PublicDeriver<> => boolean = (publicDeriver) => {
    return !this.getTxHistoryState(publicDeriver).requests.headRequest.wasExecuted;
  }

  clearCache: PublicDeriver<> => void = (publicDeriver) => {
    const txs = this.getTxHistoryState(publicDeriver).txs;
    txs.splice(0, txs.length - 1);
  }

  getBalance: PublicDeriver<> => MultiToken | null = (publicDeriver) => {
    return this.getTxHistoryState(publicDeriver).requests.getBalanceRequest.result || null;
  }

  getAssetDeposit: PublicDeriver<> => MultiToken | null = (publicDeriver) => {
    return this.getTxHistoryState(publicDeriver).requests.getAssetDepositRequest.result || null;
  }

  getLastSyncInfo: PublicDeriver<> => IGetLastSyncInfoResponse = (publicDeriver) => {
    return this.getTxHistoryState(publicDeriver).lastSyncInfo;
  }

  /** Refresh transaction history and update wallet balance */
  @action _refreshTransactionData: {|
    publicDeriver: PublicDeriver<>,
    isLocalRequest: boolean,
  |} => Promise<void> = async (request) => {
    const publicDeriver = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(request.publicDeriver);
    if (publicDeriver == null) {
      return;
    }

    const {
      headRequest,
      getBalanceRequest,
      getAssetDepositRequest
    } = this.getTxHistoryState(request.publicDeriver).requests;

    headRequest.invalidate({ immediately: false });
    headRequest.execute({
      publicDeriver,
      isLocalRequest: request.isLocalRequest
    });
    if (headRequest.promise == null) {
      throw new Error('unexpected nullish headRequest.promise');
    }
    const result = await headRequest.promise;
    const { txs } = this.getTxHistoryState(request.publicDeriver);
    runInAction(() => {
      for (let i = 0; i < result.length; i++) {
        const tx = result[i];
        if (tx.txid === txs[0]?.txid) {
          break;
        }
        txs.splice(i, 0, tx);
      }
    });

    // update last sync (note: changes even if no new transaction is found)
    {
      const lastUpdateDate = await this.api.common.getTxLastUpdatedDate({
        getLastSyncInfo: publicDeriver.getLastSyncInfo
      });
      runInAction(() => {
        this.getTxHistoryState(request.publicDeriver).lastSyncInfo = lastUpdateDate;
      });
    }

    const timestamps: Set<number> = new Set();
    const remoteTransactionIds: Set<string> = new Set();
    for (const { txid, date } of result) {
      timestamps.add(date.valueOf());
      remoteTransactionIds.add(txid);
    }

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
      timestamps: Array.from(timestamps),
      defaultToken: ticker,
    });

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

    // update token info cache
    await this.stores.tokenInfoStore.refreshTokenInfo();

    // update balance
    const deriverParent = request.publicDeriver.getParent();
    const networkInfo = deriverParent.getNetworkInfo();
    const defaultToken = deriverParent.getDefaultToken();
    const isCardano = isCardanoHaskell(networkInfo);
    const coinsPerUtxoWord = isCardano ?
      getCoinsPerUtxoWord(networkInfo)
      : RustModule.WalletV4.BigNum.zero();

    // <TODO:PLUTUS_SUPPORT>
    const utxoHasDataHash = false;

    await (async () => {
      const canGetBalance = asGetBalance(publicDeriver);
      if (canGetBalance == null) {
        return;
      }
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
  }

  @action _loadMore: (
    PublicDeriver<> & IGetLastSyncInfo,
  ) => Promise<void> = async (
    publicDeriver: PublicDeriver<> & IGetLastSyncInfo,
  ) => {
    const withLevels = asHasLevels<
      ConceptualWallet,
      IGetLastSyncInfo
    >(publicDeriver);
    if (withLevels == null) {
      throw new Error(`${nameof(this._loadMore)} no levels`);
    }
    const state = this.getTxHistoryState(publicDeriver);
    const { tailRequest } = state.requests;

    tailRequest.invalidate({ immediately: false });
    tailRequest.execute({
      publicDeriver: withLevels,
      isLocalRequest: false,
      afterTxs: state.txs,
    });
    if (!tailRequest.promise) throw new Error('should never happen');
    const result = await tailRequest.promise;
    runInAction(() => {
      state.txs.splice(state.txs.length, 0, ...result);
      state.hasMoreToLoad = result.length === FETCH_TXS_BATCH_SIZE;
    });
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
      this.txHistoryStates,
      { publicDeriver: request.publicDeriver }
    );
    if (foundRequest != null) {
      return;
    }
    this.txHistoryStates.push({
      publicDeriver: request.publicDeriver,
      lastSyncInfo: request.lastSyncInfo,
      txs: [],
      hasMoreToLoad: true, // assuming yes until actually loaded and found otherwise 
      requests: {
        // note: this captures the right API for the wallet
        headRequest: new CachedRequest<GetTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshTransactions
        ),
        tailRequest: new CachedRequest<GetTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshTransactions
        ),
        getBalanceRequest: new CachedRequest<GetBalanceFunc>(this.api.common.getBalance),
        getAssetDepositRequest: new CachedRequest<GetBalanceFunc>(this.api.common.getAssetDeposit),
        pendingRequest: new CachedRequest<RefreshPendingTransactionsFunc>(
          this.stores.substores[apiType].transactions.refreshPendingTransactions
        ),
      },
    });
  }

  getTxHistoryState: (
    PublicDeriver<>
  ) => TxHistoryState = (
    publicDeriver
  ) => {
    const foundState = find(this.txHistoryStates, { publicDeriver });
    if (foundState == null) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.getTxHistoryState)} no state found`);
    }
    return foundState;
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
