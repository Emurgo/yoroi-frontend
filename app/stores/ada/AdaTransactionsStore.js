// @flow

import LocalizableError from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import Store from '../base/Store';
import { isValidAmountInLovelaces } from '../../utils/validations';
import type {
  IPublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { IHasLevels } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import type {
  ExportTransactionsRequest,
  GetTransactionsFunc,
} from '../../api/common';
import { getApiForCoinType } from '../../api/index';

import type { TransactionRowsToExportRequest } from '../../actions/common/transactions-actions';

export default class AdaTransactionsStore extends Store {

  /** Wrap utility function to expose to components/containers */
  validateAmount: string => Promise<boolean> = (
    amountInLovelaces: string
  ): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

  refreshTransactions: GetTransactionsFunc = (request) => {
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    return this.api.ada.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
    });
  }

  exportTransactionsToFile: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
    exportRequest: TransactionRowsToExportRequest,
  |} => Promise<void => Promise<void>> = async (request) => {
    const txStore = this.stores.transactions;
    const respTxRows = [];
    await txStore.getTransactionRowsToExportRequest.execute(async () => {
      const rows = await this.api.ada.getTransactionRowsToExport({
        publicDeriver: request.publicDeriver,
        ...request.exportRequest,
      });
      respTxRows.push(...rows);
    }).promise;

    if (respTxRows.length < 1) {
      throw new LocalizableError(globalMessages.noTransactionsFound);
    }

    const { coinType } = request.publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    const req: ExportTransactionsRequest = {
      ticker: this.api[apiType].constructor.getCurrencyMeta().primaryTicker,
      rows: respTxRows
    };
    return async () => {
      await this.stores.transactions.exportTransactions.execute(req).promise;
    };
  }
}
