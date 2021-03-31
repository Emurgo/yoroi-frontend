// @flow
import { observable } from 'mobx';
import BaseStateFetchStore from '../base/BaseStateFetchStore';
import type { RequiredStores } from '../base/BaseStateFetchStore';

import type { IFetcher } from '../../api/ergo/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/ergo/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ergo/lib/state-fetch/batchedFetcher';
import environment from '../../environment';

export default class ErgoStateFetchStore<
  TStores: RequiredStores,
  TActions
> extends BaseStateFetchStore<
  TStores,
  TActions,
  IFetcher
> {

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
