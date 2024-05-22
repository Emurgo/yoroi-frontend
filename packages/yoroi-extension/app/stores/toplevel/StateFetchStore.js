// @flow
import { observable, } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/common/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../api/common/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/common/lib/state-fetch/batchedFetcher';
import environment from '../../environment';

export default class StateFetchStore<
  StoresMapType: {
    +profile: {
      +currentLocale: string,
      ...
    },
    ...
  },
  ActionsMapType
> extends Store<StoresMapType, ActionsMapType> {

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
