// @flow

import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import BaseCoinPriceStore from '../base/BaseCoinPriceStore';

export default class CoinPriceStore extends BaseCoinPriceStore<StoresMap, ActionsMap> {
  setup(): void {
    super.setup();
  }
}
