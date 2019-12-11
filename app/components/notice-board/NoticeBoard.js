// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';

import styles from './NoticeBoard.scss';
import Notice from '../../domain/Notice';
import globalMessages from '../../i18n/global-messages';
import NoticeBlock from './NoticeBlock';

const messages = defineMessages({
  type: {
    id: 'wallet.transaction.type',
    defaultMessage: '!!!{currency} transaction',
  },
});

type Props = {|
  +loadedNotices: Array<Notice>,
  +allLoaded: boolean
|};

const DATE_FORMAT = 'YYYY-MM-DD';

type NoticesByDate = {|
  +strDate: string,
  +notices: Array<Notice>,
  isToday: boolean,
  isYesterday: boolean,
|};

export default class NoticeBoard extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };
  localizedDateFormat: string = 'MM/DD/YYYY';

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.localizedDateFormat = moment.localeData().longDateFormat('L');
    // Localized dateFormat:
    // English - MM/DD/YYYY
    // Japanese - YYYY/MM/DD
  }

  groupNoticesByDay(notices: Array<Notice>): Array<NoticesByDate> {
    const groups: Array<NoticesByDate> = [];

    for (const notice of notices) {
      const strDate: string = moment(notice.date).format(DATE_FORMAT);
      // find the group this notice belongs in
      let group = groups.find((g) => g.strDate === strDate);
      // if first notice in this group, create the group
      if (!group) {
        group = {
          strDate,
          isToday: false,
          isYesterday: false,
          notices: []
        };
        groups.push(group);
      }
      group.notices.push(notice);
    }

    for (const group of groups) {
      const today = moment().format(DATE_FORMAT);
      group.isToday = (group.strDate === today);

      const yesterday = moment().subtract(1, 'days').format(DATE_FORMAT);
      group.isYesterday = (group.strDate === yesterday);
    }

    return groups.sort(
      (a, b) => b.notices[0].date.getTime() - a.notices[0].date.getTime()
    );
  }

  localizedDate(noticesByDate: NoticesByDate) {
    const { intl } = this.context;
    if (noticesByDate.isToday) return intl.formatMessage(globalMessages.dateToday);

    if (noticesByDate.isYesterday) return intl.formatMessage(globalMessages.dateYesterday);

    return moment(noticesByDate.strDate).format(this.localizedDateFormat);
  }

  render() {
    const { loadedNotices, allLoaded } = this.props;
    const noticeGroup = this.groupNoticesByDay(loadedNotices);

    return (
      <div className={styles.component}>
        {noticeGroup.map(group => (
          <div className={styles.group} key={group.strDate}>
            <div className={styles.groupDate}>{this.localizedDate(group)}</div>
            <div>
              {group.notices.map((notice) => (
                <NoticeBlock
                  key={`${group.strDate}-${notice.id}-${notice.kind}`}
                  notice={notice}
                  isToday={group.isToday}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
