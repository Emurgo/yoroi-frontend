// @flow
import { override } from 'mobx';
import BaseStateFetchStore from '../base/BaseStateFetchStore';
import type { RequiredStores } from '../base/BaseStateFetchStore';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ada/lib/state-fetch/batchedFetcher';
import environment from '../../environment';

export default class AdaStateFetchStore<
  TStores: RequiredStores,
  TActions
> extends BaseStateFetchStore<
  TStores,
  TActions,
  IFetcher
> {

  @override fetcher: IFetcher;

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
