// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ada/lib/state-fetch/batchedFetcher';

export default class StateFetchStore extends Store {

  @observable fetcher: IFetcher;

  setup() {
    this.fetcher = new BatchedFetcher(new RemoteFetcher(
      lastLaunchVersion => this.stores.profile.lastLaunchVersion,
      currentLocale => this.stores.profile.currentLocale
    ));
  }
}
