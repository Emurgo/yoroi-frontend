// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ada/lib/state-fetch/batchedFetcher';
import environment from '../../environment';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class AdaStateFetchStore extends Store<StoresMap, ActionsMap> {

  @observable fetcher: IFetcher;

  setup(): void {
    super.setup();
    this.fetcher = new BatchedFetcher(new RemoteFetcher(
      () => environment.getVersion(),
      () => this.stores.profile.currentLocale,
      () => {
        if (environment.userAgentInfo.isFirefox()) {
          return 'firefox';
        }
        if (environment.userAgentInfo.isChrome()) {
          return 'chrome';
        }
        return '-';
      },
    ));
  }
}
