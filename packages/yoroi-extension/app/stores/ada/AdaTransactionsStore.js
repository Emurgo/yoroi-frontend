// @flow

import Store from '../base/Store';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsFunc,
  GetTransactionsResponse,
  RefreshPendingTransactionsFunc,
} from '../../api/common';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  HaskellShelleyTxSignRequest,
} from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

export default class AdaTransactionsStore extends Store<StoresMap, ActionsMap> {

  refreshTransactions: GetTransactionsFunc = async (request: BaseGetTransactionsRequest) => {
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    const txs: GetTransactionsResponse = await this.api.ada.refreshTransactions({
      ...request,
      getRecentTransactionHashes: stateFetcher.getRecentTransactionHashes,
      getTransactionsByHashes: stateFetcher.getTransactionsByHashes, 
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
      getTokenInfo: stateFetcher.getTokenInfo,
      getMultiAssetMetadata: stateFetcher.getMultiAssetMintMetadata
    });

    return txs;
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ada.refreshPendingTransactions(request);
  }

  recordSubmittedTransaction: (
    PublicDeriver<>,
    HaskellShelleyTxSignRequest,
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
    const { usedUtxos, transaction } = await this.api.ada.createSubmittedTransactionData(
      publicDeriver,
      signRequest,
      txId,
      defaultNetworkId,
      defaultToken,
    );

    this.stores.transactions.recordSubmittedTransaction(
      publicDeriver,
      transaction,
      usedUtxos,
    );
  }
}
