// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/common/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../api/common/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/common/lib/state-fetch/batchedFetcher';
import environment from '../../environment';
import { getPlatform } from '../../../chrome/extension/background/utils';

export default class StateFetchStore<
  StoresMapType: {
    +profile: {
      +currentLocale: string,
      +getCurrentNetworkId: function,
      ...
    },
    ...
  },
> extends Store<StoresMapType> {
  @observable fetcher: IFetcher;

  setup(): void {
    super.setup();
    this.fetcher = new BatchedFetcher(
      new RemoteFetcher(
        () => environment.getVersion(),
        () => this.stores.profile.currentLocale,
        getPlatform,
        () => this.stores.profile.getCurrentNetworkId()
      )
    );
  }
}
