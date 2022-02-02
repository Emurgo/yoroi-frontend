// @flow

import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../../../stores/base/BaseCoinPriceStore';

export default class ConnectorCoinPriceStore extends BaseCoinPriceStore<StoresMap, ActionsMap> {
  setup(): void {
    super.setup();
    this.loadPubKeyData().then(() => {
      this.startPoll();
    });
  }
  async updatePricesForWallet(): ?Promise<void> {
    await this.refreshCurrentCoinPrice();
  }
}
