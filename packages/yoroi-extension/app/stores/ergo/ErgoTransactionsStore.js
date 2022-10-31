// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
  RefreshPendingTransactionsFunc,
} from '../../api/common';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ErgoTxSignRequest } from '../../api/ergo/lib/transactions/ErgoTxSignRequest';

export default class ErgoTransactionsStore extends Store<StoresMap, ActionsMap> {
  refreshTransactions: GetTransactionsFunc = (request) => {
    const stateFetcher = this.stores.substores.ergo.stateFetchStore.fetcher;
    return this.api.ergo.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getAssetInfo: stateFetcher.getAssetInfo,
      getBestBlock: stateFetcher.getBestBlock,
    });
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ergo.refreshPendingTransactions(request);
  }

  recordSubmittedTransaction: (
    PublicDeriver<>,
    ErgoTxSignRequest,
    string,
  ) => Promise<void> = async (
    publicDeriver,
    signRequest,
    txId,
  ) => {
    const defaultNetworkId = publicDeriver.getParent().getNetworkInfo().NetworkId;
    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(
      defaultNetworkId,
    );
    const transaction = await this.api.ergo.createSubmittedTransactionData(
      publicDeriver,
      signRequest,
      txId,
      defaultNetworkId,
      defaultToken,
    );

    this.stores.transactions.recordSubmittedTransaction(
      publicDeriver,
      transaction,
      [],
    );
  }
}
