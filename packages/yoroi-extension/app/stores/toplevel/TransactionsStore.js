// @flow
import { action, computed, observable, runInAction } from 'mobx';
import { find } from 'lodash';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import WalletTransaction from '../../domain/WalletTransaction';
import type { GetBalanceFunc } from '../../api/common/types';
import type {
  ExportTransactionsFunc,
  GetTransactionsFunc,
  GetTransactionsResponse,
  RefreshPendingTransactionsFunc,
} from '../../api/common/index';
import {
  asGetAllUtxos,
  asGetPublicKey,
  asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetLastSyncInfo,
  IGetLastSyncInfoResponse,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmount.types';
import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import { Logger, stringifyError } from '../../utils/logging';
import type { TransactionRowsToExportRequest } from '../../actions/common/transactions-actions';
import globalMessages from '../../i18n/global-messages';
import * as timeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  networks,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { DefaultTokenEntry, TokenEntry } from '../../api/common/lib/MultiToken';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { genLookupOrFail, getTokenName } from '../stateless/tokenHelpers';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { asAddressedUtxo, cardanoValueFromRemoteFormat } from '../../api/ada/transactions/utils';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../../api/ada/lib/storage/database/primitives/enums';
import type { NetworkRow, AddressRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { CardanoAddressedUtxo } from '../../api/ada/transactions/types';
import moment from 'moment';
import { getAllAddressesForWallet } from '../../api/ada/lib/storage/bridge/traitUtils';
import { toRequestAddresses } from '../../api/ada/lib/storage/bridge/updateTransactions'
import type { TransactionExportRow } from '../../api/export';
import type { HistoryRequest } from '../../api/ada/lib/state-fetch/types';
import appConfig from '../../config';
import { refreshTransactions } from '../../api/thunk';
import type { LastSyncInfoRow, } from '../../api/ada/lib/storage/database/walletTypes/core/tables';
import type { WalletState } from '../../../chrome/extension/background/types';

export type TxHistoryState = {|
  publicDeriverId: number,
  lastSyncInfo: IGetLastSyncInfoResponse,
  txs: Array<WalletTransaction>,
  hasMoreToLoad: boolean,
  requests: {|
    // used to initially load the saved txs and then periodically refresh for
    // new txs
    headRequest: CachedRequest<typeof refreshTransactions>,
    // used to "load more transactions"
    tailRequest: CachedRequest<typeof refreshTransactions>,
  |},
|};

const EXPORT_START_DELAY = 800; // in milliseconds [1000 = 1sec]

function getCoinsPerUtxoWord(network: $ReadOnly<NetworkRow>): RustModule.WalletV4.BigNum {
  const config = getCardanoHaskellBaseConfig(network).reduce(
    (acc, next) => Object.assign(acc, next),
    {}
  );
  return RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord);
}

function newMultiToken(
  defaultTokenInfo: DefaultTokenEntry,
  values: Array<TokenEntry> = []
): MultiToken {
  return new MultiToken(values, defaultTokenInfo);
}

export default class TransactionsStore extends Store<StoresMap, ActionsMap> {
  /** Track transactions for a set of wallets */
  @observable txHistoryStates: Array<TxHistoryState> = [];

  /** Track banners open status */
  @observable showDelegationBanner: boolean = true;

  /*
   * This transient state only used to store a flag that a reward withdrawal has been processed for some wallet.
   * Needed to cancel out the utxo balance being synced before the reward balance which was causing a higher
   * total balance to be displayed for few seconds.
   *
   * NOT PERSISTED
   */
  @observable _processedWithdrawals: Set<number> = new Set;

  getTransactionRowsToExportRequest: LocalizedRequest<
    ((void) => Promise<void>) => Promise<void>
  > = new LocalizedRequest<((void) => Promise<void>) => Promise<void>>(func => func());
  exportTransactions: LocalizedRequest<ExportTransactionsFunc> = new LocalizedRequest<ExportTransactionsFunc>(
    this.api.export.exportTransactions
  );
  @observable isExporting: boolean = false;
  @observable exportError: ?LocalizableError;
  @observable shouldIncludeTxIds: boolean = false;

  setup(): void {
    super.setup();
    const actions = this.actions.transactions;
    actions.loadMoreTransactions.listen(this._loadMore);
    actions.exportTransactionsToFile.listen(this._exportTransactionsToFile);
    actions.closeExportTransactionDialog.listen(this._closeExportTransactionDialog);
    actions.closeDelegationBanner.listen(this._closeDelegationBanner);
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

  @computed get recent(): Array<WalletTransaction> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const { txs } = this.getTxHistoryState(publicDeriver.publicDeriverId);
    const submittedTxs = publicDeriver.submittedTransactions.map(
      ({ transaction }) => CardanoShelleyTransaction.fromData(transaction)
    );
    return  [ ...submittedTxs, ...txs ];
  }

  @computed get hasAny(): boolean {
    return this.recent.length > 0;
  }

  @computed get hasAnyPending(): boolean {
    return false;
  }

  @computed get hasMoreToLoad(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    return this.getTxHistoryState(publicDeriver.publicDeriverId).hasMoreToLoad;
  }

  // todo: legacy code to be removed
  @computed get balance(): MultiToken | null {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return null;
    return publicDeriver.balance;
  }

  @computed get isLoadingMore(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.isLoadingMore)} no wallet selected`);
    }
    const { tailRequest } = this.getTxHistoryState(publicDeriver.publicDeriverId).requests;

    return tailRequest.isExecuting;
  }

  @computed get isLoading(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.isLoading)} no wallet selected`);
    }
    const { headRequest, tailRequest } = this.getTxHistoryState(publicDeriver.publicDeriverId).requests;

    return !headRequest.wasExecuted && !tailRequest.wasExecuted;
  }

  isWalletLoading: number => boolean = (publicDeriverId) => {
    return !this.getTxHistoryState(publicDeriverId).requests.headRequest.wasExecuted;
  }

  @action
  clearCache: number => void = (publicDeriverId) => {
    const txs = this.getTxHistoryState(publicDeriverId).txs;
    txs.splice(0, txs.length);
  }

  // various actions that need to be performed after getting new transactions
  _afterLoadingNewTxs: (
    Array<WalletTransaction>,
    { networkId: number, publicDeriverId: number, ... },
  ) => Promise<void> = async (result, publicDeriver) => {
    const timestamps: Set<number> = new Set();
    const remoteTransactionIds: Set<string> = new Set();
    const withdrawalIds = new Set<string>();
    for (const tx of result) {
      const { txid, date } = tx;
      timestamps.add(date.valueOf());
      remoteTransactionIds.add(txid);
      if (tx instanceof CardanoShelleyTransaction && tx.withdrawals.length > 0) {
        withdrawalIds.add(txid);
      }
    }
    const defaultTokenInfo = this.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.networkId,
    );
    const ticker = defaultTokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected default token type');
    }
    /* fixme
    await this.stores.coinPriceStore.updateTransactionPriceData({
      db: publicDeriver.getDb(),
      timestamps: Array.from(timestamps),
      defaultToken: ticker,
    });
    */

    // reload token info cache
    await this.stores.tokenInfoStore.refreshTokenInfo();
  }

  @action refreshTransactionData: {|
    +publicDeriver: WalletState,
  |} => Promise<void> = async (request) => {
    const { publicDeriverId } = request.publicDeriver;

    const txHistoryState = this.getTxHistoryState(publicDeriverId);
    const isEmptyHistory = txHistoryState.txs.length === 0;

    const { headRequest, } = txHistoryState.requests;

    let result;
    if (isEmptyHistory) {
      /*
       * TAIL REQUEST IS USED WHEN FIRST SYNC OR EMPTY WALLET
       */
      result = await this._internalTailRequestForTxs({
        publicDeriver: request.publicDeriver,
      });
    } else {
      /*
       * HEAD REQUEST IS USED WITH `AFTER` REFERENCE
       * WHEN NON-EMPTY WALLET
       */
      headRequest.invalidate({ immediately: false });
      headRequest.execute({
        publicDeriverId,
        // HEAD request is never local by logic
        isLocalRequest: true,
        afterTx: txHistoryState.txs[0],
      });
      if (headRequest.promise == null) {
        throw new Error('unexpected nullish headRequest.promise');
      }
      result = await headRequest.promise;
      {
        /**
         * Adding received txs to the start of the existing history
         */
        const { txs } = this.getTxHistoryState(request.publicDeriver.publicDeriverId);
        runInAction(() => {
          for (let i = 0; i < result.length; i++) {
            const tx = result[i];
            if (tx.txid === txs[0]?.txid) {
              // In case received tx matches with the existing one - stop
              break;
            }
            txs.splice(i, 0, tx);
          }
        });
      }
    }

    // note: possible existing memos were modified on a difference instance, etc.e
    await this.actions.memos.syncTxMemos.trigger(request.publicDeriver);

    await this._afterLoadingNewTxs(
      result,
      request.publicDeriver,
    );
  }

  _internalTailRequestForTxs: ({|
    +publicDeriver: { publicDeriverId: number, networkId: number, ... },
  |}) => Promise<GetTransactionsResponse> = async ({
    publicDeriver,
  }) => {
    const { publicDeriverId } = publicDeriver;
    const state = this.getTxHistoryState(publicDeriverId);
    const { tailRequest } = state.requests;

    const beforeTx = state.txs[state.txs.length-1];

    tailRequest.invalidate({ immediately: false });
    tailRequest.execute({
      publicDeriverId,
      isLocalRequest: true,
      beforeTx,
    });
    if (!tailRequest.promise) throw new Error('unexpected nullish tailRequest.promise');
    const result = await tailRequest.promise;
    runInAction(() => {
      state.txs.splice(state.txs.length, 0, ...result);
      state.hasMoreToLoad = result.length >= appConfig.wallets.MAX_RECENT_TXS_PER_LOAD;
    });
    return result;
  }

  @action _loadMore: (
    { networkId: number, publicDeriverId: number, ... },
  ) => Promise<void> = async (publicDeriver) => {
    const result = await this._internalTailRequestForTxs({ publicDeriver });
    await this._afterLoadingNewTxs(result, publicDeriver);
  }

  /** Add a new public deriver to track and refresh the data */
  @action addObservedWallet: ({
    publicDeriverId: number, lastSyncInfo: $ReadOnly<LastSyncInfoRow>, ... 
  }) => void = (
    publicDeriver
  ) => {
    const { publicDeriverId } = publicDeriver;
    const foundRequest = find(this.txHistoryStates, { publicDeriverId });

    if (foundRequest != null) {
      return;
    }
    this.txHistoryStates.push({
      publicDeriverId,
      lastSyncInfo: publicDeriver.lastSyncInfo,
      txs: [],
      hasMoreToLoad: true, // assuming yes until actually loaded and found otherwise
      requests: {
        headRequest: new CachedRequest(refreshTransactions),
        tailRequest: new CachedRequest(refreshTransactions),
      },
    });
  }

  getTxHistoryState: (number) => TxHistoryState = (publicDeriverId) => {
    const foundState = find(this.txHistoryStates, { publicDeriverId });
    if (foundState == null) {
      throw new Error(`${nameof(TransactionsStore)}::${nameof(this.getTxHistoryState)} no state found`);
    }
    return foundState;
  };

  @action _exportTransactionsToFile: ({|
    publicDeriver: WalletState,
    exportRequest: TransactionRowsToExportRequest,
  |}) => Promise<void> = async (request) => {
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
          this.shouldIncludeTxIds = false;
        });
      }, EXPORT_START_DELAY);
    } catch (error) {
      let localizableError = error;
      if (!(error instanceof LocalizableError)) {
        localizableError = new UnexpectedError();
      }

      this._setExportError(localizableError);
      this._setExporting(false);
      Logger.error(
        `${nameof(TransactionsStore)}::${nameof(this._exportTransactionsToFile)} ${stringifyError(
          error
        )}`
      );
    } finally {
      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();
    }
  };

  @action _setExporting: boolean => void = isExporting => {
    this.isExporting = isExporting;
  };

  @action _setExportError: (?LocalizableError) => void = error => {
    this.exportError = error;
  };

  @action _closeExportTransactionDialog: void => void = () => {
    if (!this.isExporting) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._setExporting(false);
      this._setExportError(null);
    }
  };

  @action _closeDelegationBanner: void => void = () => {
    this.showDelegationBanner = false;
  };

  exportTransactionsToFile: ({|
    +publicDeriver: WalletState,
    exportRequest: TransactionRowsToExportRequest,
  |}) => Promise<(void) => Promise<void>> = async request => {
    const txStore = this.stores.transactions;
    let respTxRows = [];

    const delegationStore = this.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(request.publicDeriver.publicDeriverId);

    const network = getNetworkById(request.publicDeriver.networkId);

    await txStore.getTransactionRowsToExportRequest.execute(async () => {
      /**
       * NOTE: The rewards export currently supports only Haskell Shelley
       */
      if (isCardanoHaskell(network) && delegationRequests) {
        const rewards = await delegationRequests.rewardHistory.promise;
        if (rewards != null) {
          const fullConfig = getCardanoHaskellBaseConfig(network);

          const absSlotFunc = await timeUtils.genToAbsoluteSlotNumber(fullConfig);
          const timeSinceGenFunc = await timeUtils.genTimeSinceGenesis(fullConfig);
          const realTimeFunc = await timeUtils.genToRealTime(fullConfig);
          const rewardRows = rewards.map(item => {
            const absSlot = absSlotFunc({
              epoch: item[0],
              slot: 0,
            });
            const epochStartDate = realTimeFunc({
              absoluteSlotNum: absSlot,
              timeSinceGenesisFunc: timeSinceGenFunc,
            });

            const defaultInfo = item[1].getDefaultEntry();
            const tokenInfo = this.stores.tokenInfoStore.tokenInfo
              .get(network.NetworkId.toString())
              ?.get(defaultInfo.identifier);
            const divider = new BigNumber(10).pow(tokenInfo?.Metadata.numberOfDecimals || 0);
            return {
              type: 'in',
              amount: defaultInfo.amount.div(divider).toString(),
              fee: '0',
              date: epochStartDate,
              comment: `Staking Reward Epoch ${item[0]}`,
              id: '',
            };
          });
          respTxRows.push(...rewardRows);
        }
      }
    }).promise;

    const { startDate, endDate } = request.exportRequest;

    const config = getCardanoHaskellBaseConfig(network);
    const timeToSlot = await timeUtils.genTimeToSlot(config);
    const toRelativeSlotNumber = await timeUtils.genToRelativeSlotNumber(config);

    const dateFormat = 'YYYY-MM-DD';
    const dateToSlot = (date: string): [number, number] => {
      const relativeSlot = toRelativeSlotNumber(
        timeToSlot({
          time: new Date(`${date}T23:59:59`), // Get the slot at the last second in the day
        }).slot
      );

      return [
        Math.max(relativeSlot.epoch, 0),
        Math.max(relativeSlot.slot, 0)
      ];
    }

    const slotsToTxs = async (
      startSlot: [number, number],
      endSlot: [number, number],
    ): Promise<Array<TransactionExportRow>> => {
      if (String(startSlot) === String(endSlot)) {
        return [];
      }
      const fetcher = this.stores.substores.ada.stateFetchStore.fetcher;
      const { blockHashes } =  await fetcher.getLatestBlockBySlot({
        network,
        slots: [startSlot, endSlot]
      });
      const startBlockHash = blockHashes[startSlot];
      const endBlockHash = blockHashes[endSlot];
      if (endBlockHash == null) {
        if (startBlockHash != null) {
          throw new Error(
            '[tx-export] Unexpected state: start block hash exists, but end block hash doesnt. Context: '
            + JSON.stringify({
              startDate, endDate, startSlot, endSlot, startBlockHash, endBlockHash,
            })
          );
        }
        // No range available
        return [];
      }
      return await this._getTxsFromRemote(request.publicDeriver, startBlockHash, endBlockHash);
    }

    const txs = await slotsToTxs(
      dateToSlot(startDate.subtract(1, 'day').format(dateFormat)),
      dateToSlot(endDate.format(dateFormat)),
    );

    respTxRows.push(...txs);

    respTxRows = respTxRows.filter(row => {
      // 4th param `[]` means that the start and end date are included
      return moment(row.date).isBetween(startDate, endDate, 'day', '[]')
    }).sort((a, b) => b.date.valueOf() - a.date.valueOf());

    if (respTxRows.length < 1) {
      throw new LocalizableError(globalMessages.noTransactionsFound);
    }

    const plate = request.publicDeriver.plate?.TextPart || null;

    return async () => {
      const defaultToken = {
        defaultNetworkId: request.publicDeriver.networkId,
        defaultIdentifier: request.publicDeriver.defaultTokenId,
      };
      const defaultTokenInfo = genLookupOrFail(this.stores.tokenInfoStore.tokenInfo)({
        identifier: defaultToken.defaultIdentifier,
        networkId: defaultToken.defaultNetworkId,
      });
      const tokenName = getTokenName(defaultTokenInfo);
      await this.stores.transactions.exportTransactions.execute({
        ticker: tokenName,
        rows: respTxRows,
        nameSuffix: plate == null ? tokenName : `${tokenName}-${plate}`,
        shouldIncludeTxIds: this.shouldIncludeTxIds,
      }).promise;
    };
  };

  _getTxsFromRemote: (
    publicDeriver: WalletState,
    startBlockHash: ?string,
    endBlockHash: string,
  ) => Promise<Array<TransactionExportRow>> = async (
    publicDeriver,
    startBlockHash,
    endBlockHash
  ) => {
    const addresses = publicDeriver.allAddresses;
    const fetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const network = getNetworkById(publicDeriver.networkId);
    const txsRequest: HistoryRequest = {
      after: undefined,
      untilBlock: endBlockHash,
      network,
      addresses: toRequestAddresses({
        utxoAddresses: addresses.utxoAddresses.map(({ address }) => address),
        accountingAddresses: addresses.accountingAddresses.map(({ address }) => address),
      }),
    };
    if (startBlockHash != null) {
      txsRequest.after = { block: startBlockHash };
    }
    const txsFromNetwork = await fetcher.getTransactionsHistoryForAddresses(txsRequest);

    const ownAddresses = new Set([
      ...addresses.utxoAddresses.map(a => a.address.Hash),
      ...addresses.accountingAddresses.map(a => a.address.Hash),
    ]);

    const result = [];
    txsFromNetwork.forEach(remoteTx => {
      let ownAmountChange = new BigNumber('0');
      let txFee = new BigNumber('0');
      for (const input of remoteTx.inputs) {
        txFee = txFee.plus(input.amount);
        if (ownAddresses.has(input.address)) {
          ownAmountChange = ownAmountChange.minus(input.amount);
        }
      }
      for (const output of remoteTx.outputs) {
        txFee = txFee.minus(output.amount);
        if (ownAddresses.has(output.address)) {
          ownAmountChange = ownAmountChange.plus(output.amount);
        }
      }

      // invariant: reported amount + fee = own amount change
      let type;
      let fee;
      let amount;
      if (ownAmountChange.isPositive()) {
        type = 'in';
        fee = new BigNumber('0');
        amount = ownAmountChange;
      } else {
        type = 'out';
        fee = txFee;
        amount = ownAmountChange.absoluteValue().minus(txFee);
      }

      if (remoteTx.time != null) {
        const time: string = remoteTx.time;
        result.push({
          type,
          amount: amount.shiftedBy(-6).toString(),
          fee: fee.shiftedBy(-6).toString(),
          date: new Date(time),
          comment: '',
          id: remoteTx.hash,
        });
      }
    });
    return result;
  }

  hasProcessedWithdrawals: ({ publicDeriverId: number, ... }) => boolean = (publicDeriver) => {
    return this._processedWithdrawals.has(publicDeriver.publicDeriverId);
  }

  clearProcessedWithdrawals: ({ publicDeriverId: number, ... }) => void = (publicDeriver) => {
    this._processedWithdrawals.delete(publicDeriver.publicDeriverId);
  }
}
