// @flow

import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../base/BaseCoinPriceStore';

export default class CoinPriceStore extends BaseCoinPriceStore<StoresMap, ActionsMap> {
  setup(): void {
    super.setup();
  }
  async updatePricesForWallet(): ?Promise<void> {
    await this.refreshCurrentCoinPrice();
    /*
    const { selected } = this.stores.wallets;
    if (selected) {
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
    */
  }
}
