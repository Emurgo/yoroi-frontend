// @flow
import { observable, action, computed } from 'mobx';
import BigNumber from 'bignumber.js';

import environment from '../../environment';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import { isValidAmountInLovelaces } from '../../utils/validations';
import TransactionsStore from '../base/TransactionsStore';
import { transactionTypes } from '../../domain/WalletTransaction';
import { assuranceLevels } from '../../config/transactionAssuranceConfig';
import { getPrice } from '../../types/unitOfAccountType';
import type {
  GetTransactionRowsToExportFunc,
} from '../../api/ada';

import type {
  ExportTransactionsRequest,
  ExportTransactionsFunc,
} from '../../api/common';

import type { TransactionRowsToExportRequest } from '../../actions/ada/transactions-actions';

const EXPORT_START_DELAY = 800; // in milliseconds [1000 = 1sec]

export default class AdaTransactionsStore extends TransactionsStore {

  setup() {
    super.setup();
    const actions = this.actions[environment.API].transactions;
    actions.exportTransactionsToFile.listen(this._exportTransactionsToFile);
    actions.closeExportTransactionDialog.listen(this._closeExportTransactionDialog);
  }

  getTransactionRowsToExportRequest: LocalizedRequest<GetTransactionRowsToExportFunc>
    = new LocalizedRequest<GetTransactionRowsToExportFunc>(this.api.ada.getTransactionRowsToExport);

  exportTransactions: LocalizedRequest<ExportTransactionsFunc>
    = new LocalizedRequest<ExportTransactionsFunc>(this.api.export.exportTransactions);

  @observable isExporting: boolean = false;

  @observable exportError: ?LocalizableError;

  /** Calculate information about transactions that are still realistically reversable */
  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const unconfirmedAmount = {
      total: new BigNumber(0),
      incoming: new BigNumber(0),
      outgoing: new BigNumber(0),
      // If any of the below values becomes null, it means price data are
      // unavailable for at least one of the transaction in the category
      // and we just give up calculating the value.
      incomingInSelectedCurrency: new BigNumber(0),
      outgoingInSelectedCurrency: new BigNumber(0),
    };

    // Get current wallet
    const wallet = this.stores.substores.ada.wallets.active;
    if (!wallet) return unconfirmedAmount;

    // Get current transactions for wallet
    const result = this._getTransactionsAllRequest(wallet.id).result;
    if (!result || !result.transactions) return unconfirmedAmount;

    const unitOfAccount = this.stores.profile.unitOfAccount;

    for (const transaction of result.transactions) {
      if (transaction.getAssuranceLevelForMode(wallet.assuranceMode) !== assuranceLevels.HIGH) {
        // total
        unconfirmedAmount.total = unconfirmedAmount.total.plus(transaction.amount.absoluteValue());

        // outgoing
        if (transaction.type === transactionTypes.EXPEND) {
          unconfirmedAmount.outgoing = unconfirmedAmount.outgoing.plus(
            transaction.amount.absoluteValue()
          );

          if (unitOfAccount.enabled) {
            const price = getPrice('ADA', unitOfAccount.currency, transaction.tickers);
            if (price !== null && unconfirmedAmount.outgoingInSelectedCurrency) {
              unconfirmedAmount.outgoingInSelectedCurrency =
                unconfirmedAmount.outgoingInSelectedCurrency.plus(
                  transaction.amount.absoluteValue().multipliedBy(price)
                );
            } else {
              unconfirmedAmount.outgoingInSelectedCurrency = null;
            }
          }
        }

        // incoming
        if (transaction.type === transactionTypes.INCOME) {
          unconfirmedAmount.incoming = unconfirmedAmount.incoming.plus(
            transaction.amount.absoluteValue()
          );
          if (unitOfAccount.enabled) {
            const price = getPrice('ADA', unitOfAccount.currency, transaction.tickers);
            if (price !== null && unconfirmedAmount.incomingInSelectedCurrency) {
              unconfirmedAmount.incomingInSelectedCurrency =
                unconfirmedAmount.incomingInSelectedCurrency.plus(
                  transaction.amount.absoluteValue().multipliedBy(price)
                );
            } else {
              unconfirmedAmount.incomingInSelectedCurrency = null;
            }
          }
        }
      }
    }
    return unconfirmedAmount;
  }

  /** Wrap utility function to expose to components/containers */
  validateAmount = (amountInLovelaces: string): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

  @action _exportTransactionsToFile = async (
    params: TransactionRowsToExportRequest
  ): Promise<void> => {
    try {
      this._setExporting(true);

      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();

      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
      this.getTransactionRowsToExportRequest.execute({
        ...params,
        getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
        checkAddressesInUse: stateFetcher.checkAddressesInUse,
      });
      if (!this.getTransactionRowsToExportRequest.promise) throw new Error('should never happen');

      const respTxRows = await this.getTransactionRowsToExportRequest.promise;

      if (respTxRows == null || respTxRows.length < 1) {
        throw new LocalizableError(globalMessages.noTransactionsFound);
      }

      /** Intentially added delay to feel smooth flow */
      setTimeout(async () => {
        const req: ExportTransactionsRequest = {
          rows: respTxRows
        };
        await this.exportTransactions.execute(req).promise;
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
      Logger.error(`AdaTransactionsStore::_exportTransactionsToFile ${stringifyError(error)}`);
    } finally {
      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();
    }
  }

  @action _setExporting = (isExporting: boolean): void  => {
    this.isExporting = isExporting;
  }

  @action _setExportError = (error: ?LocalizableError): void => {
    this.exportError = error;
  }

  @action _closeExportTransactionDialog = (): void => {
    if (!this.isExporting) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._setExporting(false);
      this._setExportError(null);
    }
  }
}
