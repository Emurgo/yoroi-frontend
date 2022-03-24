// @flow

import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../base/BaseCoinPriceStore';

export default class CoinPriceStore extends BaseCoinPriceStore<StoresMap, ActionsMap> {
  setup(): void {
  }
  async updatePricesForWallet(): ?Promise<void> {
    const { selected } = this.stores.wallets;
    if (selected) {
      await this.refreshCurrentCoinPrice(selected.getParent().getNetworkInfo());
      const { allRequest } = this.stores.transactions
        .getTxRequests(selected).requests;

      const timestamps = allRequest.result?.timestamps;
      if (allRequest.wasExecuted && timestamps) {
        await this.stores.coinPriceStore.updateTransactionPriceData({
          db: selected.getDb(),
          timestamps,
        });
      }
    }
  }
}
