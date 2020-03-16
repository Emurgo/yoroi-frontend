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
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';

import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import { isValidAmountInLovelaces } from '../../utils/validations';
import TransactionsStore from '../base/TransactionsStore';
import { assuranceLevels, } from '../../config/transactionAssuranceConfig';
import type {
  GetTransactionRowsToExportFunc,
} from '../../api/ada';
import { asHasLevels, } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import WalletTransaction from '../../domain/WalletTransaction';
import type { AssuranceMode } from '../../types/transactionAssuranceTypes';
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

  /** Calculate information about transactions that are still realistically reversible */
  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const unconfirmedAmount = {
      total: new BigNumber(0),
      incoming: new BigNumber(0),
      outgoing: new BigNumber(0),
    };

    // Get current public deriver
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return unconfirmedAmount;

    // Get current transactions for public deriver
    const result = this.getTransactionsAllRequest(publicDeriver).result;
    if (!result || !result.transactions) return unconfirmedAmount;

    const { assuranceMode } = this.stores.substores.ada.walletSettings
      .getPublicDeriverSettingsCache(publicDeriver);
    return calculateUnconfirmedAmount(result.transactions, assuranceMode);
  }

  /** Wrap utility function to expose to components/containers */
  validateAmount: string => Promise<boolean> = (
    amountInLovelaces: string
  ): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

  @action _exportTransactionsToFile: {|
    publicDeriver: PublicDeriver<>,
    exportRequest: TransactionRowsToExportRequest,
  |} => Promise<void> = async (request) => {
    try {
      this._setExporting(true);

      this.getTransactionRowsToExportRequest.reset();
      this.exportTransactions.reset();

      const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
      if (!withLevels) return;

      const respTxRows = await this.getTransactionRowsToExportRequest.execute({
        publicDeriver: withLevels,
        ...request.exportRequest,
      }).promise;

      if (respTxRows == null || respTxRows.length < 1) {
        throw new LocalizableError(globalMessages.noTransactionsFound);
      }

      /** Intentionally added delay to feel smooth flow */
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
      Logger.error(`${nameof(AdaTransactionsStore)}::${nameof(this._exportTransactionsToFile)} ${stringifyError(error)}`);
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
}

export function calculateUnconfirmedAmount(
  transactions: Array<WalletTransaction>,
  assuranceMode: AssuranceMode,
): UnconfirmedAmount {
  const unconfirmedAmount = {
    total: new BigNumber(0),
    incoming: new BigNumber(0),
    outgoing: new BigNumber(0),
  };

  for (const transaction of transactions) {
    const assuranceForTx = transaction.getAssuranceLevelForMode(assuranceMode);
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
