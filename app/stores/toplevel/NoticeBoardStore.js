// @flow
import {
  action,
  observable,
  runInAction,
  computed
} from 'mobx';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import Notice from '../../domain/Notice';
import type {
  GetNoticesFunc,
  GetNoticesRequestOptions
} from '../../api/ada';

/** How many notices to display */
const INITIAL_SEARCH_LIMIT = 5;

/** How many additional notices to display when user wants to show more */
const SEARCH_LIMIT_INCREASE = 5;

/** Skip first n notices from api */
const SEARCH_SKIP = 0;

/** Manages presistent notifications */
export default class NoticeBoardStore extends Store {

  @observable loadedNotices: Array<Notice> = [];
  @observable totalNotice: number;
  @observable isLoading: boolean = false;

  getNoticesRequest: LocalizedRequest<GetNoticesFunc>
     = new LocalizedRequest<GetNoticesFunc>(this.api.ada.getNotices);

  searchOptions: GetNoticesRequestOptions;

  setup(): void {
    super.setup();
    this.actions.noticeBoard.loadMore.listen(this._loadMore);
    this.init();
  }

  async init(): Promise<void> {
    this.searchOptions = {
      skip: SEARCH_SKIP,
      limit: INITIAL_SEARCH_LIMIT
    };

    await this._loadNew();
  }

  _loadMore = async () => {
    this.searchOptions.limit += SEARCH_LIMIT_INCREASE;
    await this._loadNew();
  }

  _loadNew = async (): Promise<void> => {
    try {
      this.setLoading(true);

      this.getNoticesRequest.reset();
      this.getNoticesRequest.execute(this.searchOptions);
      if (!this.getNoticesRequest.promise) throw new Error('should never happen');

      const noticesResp = await this.getNoticesRequest.promise;

      runInAction(() => {
        this.loadedNotices = noticesResp.notices;
        this.totalNotice = noticesResp.total;
      });
    } finally {
      this.setLoading(false);
      this.getNoticesRequest.reset();
    }
  }

  @action
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  @computed
  get hasMoreToLoad(): boolean {
    return this.loadedNotices.length < this.totalNotice;
  }
}
