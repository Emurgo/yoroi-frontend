// @flow
import { AsyncAction } from './lib/Action';

// ======= NOTICE-BOARD ACTIONS =======

export default class NoticeBoardActions {
  loadMore: AsyncAction<void> = new AsyncAction();
}
