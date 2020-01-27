// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import jdenticon from 'jdenticon';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { PoolTuples } from '../../../../api/ada/lib/state-fetch/types';
import Timer from '../../../widgets/Timer';
import CustomTooltip from '../../../widgets/CustomTooltip';
import LoadingSpinner from '../../../widgets/LoadingSpinner';

import Card from './Card';
import styles from './UpcomingRewards.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.upcomingRewards.title',
    defaultMessage: '!!!Upcoming Rewards',
  },
  at: {
    id: 'wallet.dashboard.upcomingRewards.at',
    defaultMessage: '!!!at',
  },
  noRewards: {
    id: 'wallet.dashboard.upcomingRewards.noRewards',
    defaultMessage: '!!!no rewards will be earned on this epoch',
  },
  firstRewardInfo: {
    id: 'wallet.dashboard.rewards.note',
    defaultMessage: '!!!The first reward is slower.',
  },
});

export type BoxInfo = {|
  epoch: number,
  time: [string, string, string, string, string],
  pools: Array<PoolTuples>,
|};
type Props = {|
  +content: [?BoxInfo, ?BoxInfo, ?BoxInfo],
  +showWarning: boolean,
  +baseUrl: string,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class UpcomingRewards extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const firstRewardWarning = this.props.showWarning
      ? [<CustomTooltip
        key="firstRewardWarning"
        toolTip={<div>{intl.formatMessage(messages.firstRewardInfo)}</div>}
      />]
      : [];

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          {this.infoToNode(this.props.content[0], firstRewardWarning)}
          {this.infoToNode(this.props.content[1], [])}
          {this.infoToNode(this.props.content[2], [])}
        </div>
      </Card>
    );
  }

  infoToNode: (?BoxInfo, Array<Node>) => Node = (info, additional) => {
    const { intl } = this.context;

    if (info == null) {
      return (
        <div className={styles.column}>
          <div className={styles.loading}>
            <LoadingSpinner />
          </div>
        </div>
      );
    }
    if (info.pools.length === 0) {
      return (
        <div className={classnames([styles.column, styles.noDelegation])}>
          <div className={styles.header}>
            <div className={styles.label}>
              {intl.formatMessage(globalMessages.epochLabel)}:&nbsp;
              {info.epoch}
            </div>
          </div>
          <div className={styles.message}>
            {intl.formatMessage(messages.noRewards)}
          </div>
        </div>
      );
    }
    return (
      <div className={styles.column}>
        <div className={styles.header}>
          <h3 className={styles.label}>
            {intl.formatMessage(globalMessages.epochLabel)}:&nbsp;
            {info.epoch}
          </h3>
          {additional}
        </div>
        <div className={styles.time}>
          <div className={styles.broad}>
            <div className={styles.monthDay}>
              {info.time[0]} {intl.formatMessage(messages.at)}
            </div>
          </div>
          <div className={styles.specific}>
            <div className={styles.timer}>
              <Timer
                time={{
                  h: info.time[1],
                  m: info.time[2],
                  s: info.time[3],
                }}
              />
            </div>
            <div className={styles.ampm}>{info.time[4]}</div>
          </div>
        </div>
        <div className={styles.pools}>
          {info.pools.map(pool => this.getAvatars(pool))}
        </div>
      </div>
    );
  }

  getAvatars: PoolTuples => Node = (pool) => {
    const avatarSource = jdenticon.toSvg(pool[0], 36, { padding: 0 });

    // Taken from Seiza (dangerouslyEmbedIntoDataURI())
    const avatar = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;


    return (
      <CustomTooltip
        key={pool[0] + pool[1]}
        toolTip={<div className={styles.poolInfo}>{pool[0]}</div>}
        isOpeningUpward={false}
      >
        <a
          className={styles.url}
          href={this.props.baseUrl + pool[0]}
          onClick={event => this.props.onExternalLinkClick(event)}
        >
          <img
            alt="User avatar"
            src={avatar}
            className={styles.avatar}
          />
        </a>
      </CustomTooltip>
    );
  }
}
