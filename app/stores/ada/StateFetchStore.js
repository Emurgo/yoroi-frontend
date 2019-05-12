// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';

export default class StateFetchStore extends Store {

  @observable fetcher: IFetcher = new RemoteFetcher();

  setup() {
  }
}
