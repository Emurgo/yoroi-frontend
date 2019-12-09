// @flow
import { observable, runInAction } from 'mobx';

import Store from '../base/Store';
import Notice from '../../domain/Notice';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  GetNoticesFunc
} from '../../api/ada';

/** How many notices to display */
const INITIAL_SEARCH_LIMIT = 5;

/** How many additional notices to display when user wants to show more */
const SEARCH_LIMIT_INCREASE = 5;

/** Manages presistent notifications */
export default class NoticeBoardStore extends Store {

  @observable loadedNotices: Array<Notice> = [];
  @observable allLoaded: boolean = false;

  getNoticesRequest: LocalizedRequest<GetNoticesFunc>
    = new LocalizedRequest<GetNoticesFunc>(this.api.ada.getNotices);

  setup(): void {
    this.actions.noticeBoard.loadMore.listen(this._loadMore);
    this._loadMore();
  }

  _loadMore = async () => {
    try {
      this.getNoticesRequest.reset();
      this.getNoticesRequest.execute({
        skip: 0,
        limit: SEARCH_LIMIT_INCREASE,
      });
      if (!this.getNoticesRequest.promise) throw new Error('should never happen');
      const newNotices = await this.getNoticesRequest.promise;
      runInAction(() => {
        if (newNotices == null || newNotices.length < SEARCH_LIMIT_INCREASE) {
          this.allLoaded = true;
        }

        if (newNotices) {
          this.loadedNotices.push(...newNotices);
        }
      });
    } finally {
      this.getNoticesRequest.reset();
    }
  }
}
