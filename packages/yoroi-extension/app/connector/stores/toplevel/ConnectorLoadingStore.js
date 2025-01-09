// @flow
import BaseLoadingStore from '../../../stores/base/BaseLoadingStore';
import type { StoresMap } from '../index';
import {
  TabIdKeys,
} from '../../../utils/tabManager';

export default class ConnectorLoadingStore extends BaseLoadingStore<StoresMap> {

  async preLoadingScreenEnd(): Promise<void> {
    await super.preLoadingScreenEnd();
    // fixme ? wait for wallets loading

    await this.stores.tokenInfoStore.refreshTokenInfo();
    await this.stores.coinPriceStore.loadFromStorage();
  }

  postLoadingScreenEnd(): void {
    super.postLoadingScreenEnd();
  }

  getTabIdKey(): string {
    return TabIdKeys.YoroiConnector;
  }
}
