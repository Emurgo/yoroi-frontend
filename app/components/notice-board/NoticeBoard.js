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

  groupNoticesByDay(notices: Array<Notice>): Array<{date: string, notices: Array<Notice>}> {
    const groups: Array<{
      date: string,
      notices: Array<Notice>
    }> = [];

    for (const notice of notices) {
      const date: string = moment(notice.date).format(DATE_FORMAT);
      // find the group this notice belongs in
      let group = groups.find((g) => g.date === date);
      // if first notice in this group, create the group
      if (!group) {
        group = { date, notices: [] };
        groups.push(group);
      }
      group.notices.push(notice);
    }
    return groups.sort(
      (a, b) => b.notices[0].date.getTime() - a.notices[0].date.getTime()
    );
  }

  localizedDate(date: string) {
    const { intl } = this.context;
    const today = moment().format(DATE_FORMAT);
    if (date === today) return intl.formatMessage(globalMessages.dateToday);

    const yesterday = moment().subtract(1, 'days').format(DATE_FORMAT);
    if (date === yesterday) return intl.formatMessage(globalMessages.dateYesterday);

    return moment(date).format(this.localizedDateFormat);
  }

  render() {
    const { loadedNotices, allLoaded } = this.props;
    const noticeGroup = this.groupNoticesByDay(loadedNotices);

    return (
      <div className={styles.component}>
        {noticeGroup.map(group => (
          <div className={styles.group} key={group.date}>
            <div className={styles.groupDate}>{this.localizedDate(group.date)}</div>
            <div className={styles.list}>
              {group.notices.map((notice) => (
                <NoticeBlock
                  key={`${group.date}-${notice.id}-${notice.kind}`}
                  notice={notice}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
