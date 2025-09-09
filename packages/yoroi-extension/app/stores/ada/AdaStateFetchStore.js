// @flow
import { observable } from 'mobx';
import BaseStateFetchStore from '../base/BaseStateFetchStore';
import type { RequiredStores } from '../base/BaseStateFetchStore';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ada/lib/state-fetch/batchedFetcher';
import environment from '../../environment';
import { getPlatform } from '../../../chrome/extension/background/utils';

export default class AdaStateFetchStore<TStores: RequiredStores> extends BaseStateFetchStore<TStores, IFetcher> {
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
