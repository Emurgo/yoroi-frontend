// @flow

import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../../../stores/base/BaseCoinPriceStore';

export default class ConnectorCoinPriceStore extends BaseCoinPriceStore<StoresMap> {
  setup(): void {
    super.setup();
  }
}
