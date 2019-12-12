// @flow
import { observable, runInAction } from 'mobx';
import moment from 'moment'; // TODO remove

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
      // const newNotices = await this.getNoticesRequest.promise;
      let next = 0;
      const newNotices = [
        new Notice({ id: (next++).toString(), kind: 2, date: new Date() }),
        new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(1, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 1, date: moment().subtract(5, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 2, date: moment().subtract(40, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(2, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 5, date: moment().subtract(5, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 6, date: moment().subtract(15, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(30, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(88, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(10, 'hours').toDate() }),
        new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'days').toDate() }),
        new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(1, 'days').toDate() }),
        new Notice({ id: (next++).toString(), kind: 1, date: new Date(2019, 11, 5, 10, 15, 20) }),
        new Notice({ id: (next++).toString(), kind: 5, date: new Date(2019, 11, 5, 8, 20, 20) }),
        new Notice({ id: (next++).toString(), kind: 6, date: new Date(2019, 11, 4, 11, 55, 29) }),
        new Notice({ id: (next++).toString(), kind: 3, date: new Date(2019, 11, 4, 2, 15, 20) }),
        new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 4, 10, 40, 20) }),
        new Notice({ id: (next++).toString(), kind: 0, date: new Date(2019, 11, 2, 10, 45, 20) }),
        new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 1, 10, 18, 20) }),
      ];

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
