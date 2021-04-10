// @flow

import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../../../stores/base/BaseCoinPriceStore';

export default class ConnectorCoinPriceStore extends BaseCoinPriceStore<StoresMap, ActionsMap> {
  setup(): void {
  }
  async updatePricesForWallet(): ?Promise<void> {
    // TODO: connector has no real concept of a selected wallet
  }
}
