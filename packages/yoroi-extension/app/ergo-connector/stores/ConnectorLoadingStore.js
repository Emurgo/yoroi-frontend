// @flow
import BaseLoadingStore from '../../stores/base/BaseLoadingStore';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from './index';
import {
  TabIdKeys,
} from '../../utils/tabManager';

export default class ConnectorLoadingStore extends BaseLoadingStore<StoresMap, ActionsMap> {

  async preLoadingScreenEnd(): Promise<void> {
    await super.preLoadingScreenEnd();

    await this.stores.tokenInfoStore.refreshTokenInfo();
    await this.stores.coinPriceStore.loadFromStorage();
    await this.stores.coinPriceStore.refreshCurrentCoinPrice();
  }

  postLoadingScreenEnd(): void {
    super.postLoadingScreenEnd();
  }

  getTabIdKey(): string {
    return TabIdKeys.ErgoConnector;
  }
}
