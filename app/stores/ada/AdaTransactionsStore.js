// @flow
import { observable, action, computed } from 'mobx';
import BigNumber from 'bignumber.js';

import environment from '../../environment';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import { transactionTypes } from '../../api/ada/transactions/types';
import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import { isValidAmountInLovelaces } from '../../utils/validations';
import TransactionsStore from '../base/TransactionsStore';
import { assuranceLevels, } from '../../config/transactionAssuranceConfig';
import type {
  GetTransactionRowsToExportFunc,
} from '../../api/ada';
import { asHasLevels, } from '../../api/ada/lib/storage/models/PublicDeriver/traits';

import type {
  ExportTransactionsRequest,
  ExportTransactionsFunc,
} from '../../api/common';

import type { TransactionRowsToExportRequest } from '../../actions/ada/transactions-actions';

const EXPORT_START_DELAY = 800; // in milliseconds [1000 = 1sec]

export default class AdaTransactionsStore extends TransactionsStore {

  setup(): void {
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
    };

    // Get current public deriver
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (!publicDeriver) return unconfirmedAmount;

    // Get current transactions for public deriver
    const result = this.getTransactionsAllRequest(publicDeriver.self).result;
    if (!result || !result.transactions) return unconfirmedAmount;

    for (const transaction of result.transactions) {
      const assuranceForTx = transaction.getAssuranceLevelForMode(publicDeriver.assuranceMode);
      if (assuranceForTx !== assuranceLevels.HIGH) {
        // total
        unconfirmedAmount.total = unconfirmedAmount.total.plus(transaction.amount.absoluteValue());

        // outgoing
        if (transaction.type === transactionTypes.EXPEND) {
          unconfirmedAmount.outgoing = unconfirmedAmount.outgoing.plus(
            transaction.amount.absoluteValue()
          );
        }

        // incoming
        if (transaction.type === transactionTypes.INCOME) {
          unconfirmedAmount.incoming = unconfirmedAmount.incoming.plus(
            transaction.amount.absoluteValue()
          );
        }
      }
    }
    return unconfirmedAmount;
  }

  /** Wrap utility function to expose to components/containers */
  validateAmount: string => Promise<boolean> = (
    amountInLovelaces: string
  ): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

  @action _exportTransactionsToFile = async (
    params: TransactionRowsToExportRequest
  ): Promise<void> => {
    try {
      this._setExporting(true);

      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();

      const publicDeriver = this.stores.substores.ada.wallets.selected;
      if (!publicDeriver) return;
      const withLevels = asHasLevels(publicDeriver.self);
      if (!withLevels) return;

      this.getTransactionRowsToExportRequest.execute({
        publicDeriver: withLevels,
        ...params,
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
