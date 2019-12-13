// @flow
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

import Notice from '../../domain/Notice';
import NoticeBlock from './NoticeBlock';
import globalMessages from '../../i18n/global-messages';

import styles from './NoticeBoard.scss';

type Props = {|
  +loadedNotices: Array<Notice>,
  +onLoadMore: Function,
  +isLoading: boolean,
  +hasMoreToLoad: boolean
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
    // https://momentjs.com/docs/#/i18n/
    this.localizedDateFormat = moment.localeData().longDateFormat('LL');
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
    const { intl } = this.context;
    const {
      loadedNotices,
      hasMoreToLoad,
      onLoadMore,
      isLoading,
    } = this.props;
    const noticeGroup = this.groupNoticesByDay(loadedNotices);

    const buttonClasses = classnames([
      'primary',
      styles.loadMoreNoticesButton,
    ]);

    return (
      <div className={styles.component}>
        <div className={styles.notices}>
          {noticeGroup.map(group => (
            <div className={styles.group} key={group.strDate}>
              <div className={styles.groupDate}>{this.localizedDate(group)}</div>
              <div>
                {group.notices.map((notice) => (
                  <NoticeBlock
                    key={`${group.strDate}-${notice.id}`}
                    notice={notice}
                    isToday={group.isToday}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        {hasMoreToLoad &&
          <Button
            disabled={isLoading}
            className={buttonClasses}
            label={intl.formatMessage(globalMessages.loadMoreButtonLabel)}
            onClick={onLoadMore}
            skin={ButtonSkin}
          />
        }
      </div>
    );
  }
}
