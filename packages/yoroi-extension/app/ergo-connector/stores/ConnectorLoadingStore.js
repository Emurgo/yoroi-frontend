// @flow
import BaseLoadingStore from '../../stores/base/BaseLoadingStore';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from './index';

export default class ConnectorLoadingStore extends BaseLoadingStore<StoresMap, ActionsMap> {

  async preLoadingScreenEnd(): Promise<void> {
    await super.preLoadingScreenEnd();
  }

  postLoadingScreenEnd(): void {
    super.postLoadingScreenEnd();
  }
}
