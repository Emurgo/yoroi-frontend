// @flow
import BaseLoadingStore from '../../../stores/base/BaseLoadingStore';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import {
  TabIdKeys,
} from '../../../utils/tabManager';
import type { lf$Database } from 'lovefield';
import { observable, runInAction } from 'mobx';
import {
  copyDbToMemory,
} from '../../../api/ada/lib/storage/database/index';

export default class ConnectorLoadingStore extends BaseLoadingStore<StoresMap, ActionsMap> {

  @observable inMemoryDb: ?lf$Database;

  async preLoadingScreenEnd(): Promise<void> {
    await super.preLoadingScreenEnd();
    if (this.loadPersistentDbRequest.result == null) {
      throw new Error(`Should never happen`);
    }

    const inMemoryDb = await copyDbToMemory(this.loadPersistentDbRequest.result);
    runInAction(() => {
      this.inMemoryDb = inMemoryDb;
    });

    await this.stores.tokenInfoStore.refreshTokenInfo();
    await this.stores.coinPriceStore.loadFromStorage();
  }

  postLoadingScreenEnd(): void {
    super.postLoadingScreenEnd();
  }

  getTabIdKey(): string {
    return TabIdKeys.YoroiConnector;
  }

  getDatabase(): ?lf$Database {
    return this.inMemoryDb;
  }
}
