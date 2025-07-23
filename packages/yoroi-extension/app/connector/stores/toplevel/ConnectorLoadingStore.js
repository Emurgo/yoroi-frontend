// @flow
import BaseLoadingStore from '../../../stores/base/BaseLoadingStore';
import type { StoresMap } from '../index';
import {
  TabIdKeys,
} from '../../../utils/tabManager';

export default class ConnectorLoadingStore extends BaseLoadingStore<StoresMap> {

  async loadingEnd(): Promise<void> {
    // fixme ? wait for wallets loading

    await this.stores.tokenInfoStore.refreshTokenInfo();
    await this.stores.coinPriceStore.loadFromStorage();
  }

  getTabIdKey(): string {
    return TabIdKeys.YoroiConnector;
  }
}
