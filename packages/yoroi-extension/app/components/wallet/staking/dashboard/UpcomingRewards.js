// @flow
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { toSvg } from 'jdenticon';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { PoolTuples } from '../../../../api/common/lib/storage/bridge/delegationUtils';
import CustomTooltip from '../../../widgets/CustomTooltip';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as AttentionIcon } from '../../../../assets/images/attention-modern.inline.svg';
import { truncateStakePool } from '../../../../utils/formatters';

import Card from './Card';
import styles from './UpcomingRewards.scss';
import { Skeleton } from '@mui/material';
import { Box } from '@mui/system';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.upcomingRewards.title',
    defaultMessage: '!!!Upcoming Rewards',
  },
  at: {
    id: 'wallet.dashboard.upcomingRewards.at',
    defaultMessage: '!!!at',
  },
  endOfEpoch: {
    id: 'wallet.dashboard.upcomingRewards.endOfEpoch',
    defaultMessage: '!!!End of Epoch',
  },
  noRewards: {
    id: 'wallet.dashboard.upcomingRewards.noRewards',
    defaultMessage: '!!!no rewards will be earned on this epoch',
  },
  firstRewardInfo: {
    id: 'wallet.dashboard.rewards.note',
    defaultMessage: '!!!The first reward is slower.',
  },
  unregisteredWarning: {
    id: 'wallet.dashboard.rewards.unregistered',
    defaultMessage: `!!!Staking key isn't registered, so you won't get rewards`,
  },
});

export type MiniPoolInfo = {|
  ticker?: ?string,
  id: PoolTuples,
  name?: ?string,
|};

export type BoxInfo = {|
  epoch: number,
  time: [string, string, string, string, string],
  pools: Array<MiniPoolInfo>,
  isCurrentEpoch?: boolean,
|};
type Props = {|
  +content: [?BoxInfo, ?BoxInfo, ?BoxInfo, ?BoxInfo],
  +showWarning: boolean,
  +baseUrl: void | string,
  +useEndOfEpoch: boolean,
  +onExternalLinkClick: MouseEvent => void,
  +unregistered: void | boolean,
|};

@observer
export default class UpcomingRewards extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const firstRewardWarning = this.props.showWarning
      ? [
        <CustomTooltip
          key="firstRewardWarning"
          toolTip={<div>{intl.formatMessage(messages.firstRewardInfo)}</div>}
        />,
        ]
      : [];

    const genUnregisteredWarning = (info: ?BoxInfo): Array<Node> => {
      if (this.props.unregistered !== true) return [];
      if (info == null) return [];
      if (info.pools.length === 0) return [];
      return [
        <CustomTooltip
          key="unregisteredWarning"
          toolTip={<div>{intl.formatMessage(messages.unregisteredWarning)}</div>}
        >
          <AttentionIcon />
        </CustomTooltip>,
      ];
    };

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={classnames([styles.wrapper, styles.epochCards])}>
          {this.infoToNode(this.props.content[0], [
            ...genUnregisteredWarning(this.props.content[0]),
            ...firstRewardWarning,
          ])}
          {this.infoToNode(this.props.content[1], genUnregisteredWarning(this.props.content[1]))}
          {this.infoToNode(this.props.content[2], genUnregisteredWarning(this.props.content[2]))}
          {this.infoToNode(this.props.content[3], genUnregisteredWarning(this.props.content[3]))}
        </div>
      </Card>
    );
  }

  getSkeleton(
    layout: {|
      width: string,
      height: string,
      marginBottom: string,
    |},
    index: number
  ): Node {
    return (
      <Skeleton
        key={index}
        variant="rectangular"
        width={layout.width}
        height={layout.height}
        animation="wave"
        sx={{
          backgroundColor: 'var(--yoroi-palette-common-white)',
          borderRadius: '4px',
          marginBottom: layout.marginBottom,
        }}
      />
    );
  }

  rewardsSkeleton(): Node {
    const skeletons = [
      { width: '95%', height: '22', marginBottom: '6px' }, // End of Epoch Label
      { width: '75%', height: '32', marginBottom: '24px' }, // Date
      { width: '95%', height: '22', marginBottom: '6px' }, // Stake pool label
      { width: '75%', height: '32', marginBottom: '0px' }, // Pool Id
    ];
    return <Box>{skeletons.map((skeleton, i) => this.getSkeleton(skeleton, i))}</Box>;
  }

  infoToNode: (?BoxInfo, Array<Node>) => Node = (info, additional) => {
    const { intl } = this.context;

    if (info == null) {
      return <div className={styles.card}>{this.rewardsSkeleton()}</div>;
    }

    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.label}>
            {this.props.useEndOfEpoch
              ? intl.formatMessage(messages.endOfEpoch)
              : intl.formatMessage(globalMessages.epochLabel)}
            : &nbsp;
            {info.isCurrentEpoch === true
              ? `${info.epoch} (${intl.formatMessage(globalMessages.current)})`
              : info.epoch}
          </h3>
          {additional}
        </div>
        <div className={styles.time}>
          <div className={styles.broad}>
            <div>
              {`${info.time[0]} ${intl.formatMessage(messages.at)} ${info.time[1]}:${
                info.time[2]
              }:${info.time[3]} ${info.time[4]}`}
            </div>
          </div>
        </div>

        <h3 className={classnames([styles.label, styles.mt20])}>
          {intl.formatMessage(globalMessages.stakePoolDelegated)}:
        </h3>
        {info.pools.length === 0 ? (
          <div>—</div>
        ) : (
          <div className={styles.pools}>{info.pools.map(pool => this.getAvatars(pool))}</div>
        )}
      </div>
    );
  };

  getAvatars: MiniPoolInfo => Node = pool => {
    const avatarSource = toSvg(pool.id[0], 36, { padding: 0 });

    // Taken from Seiza (dangerouslyEmbedIntoDataURI())
    const avatar = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    const tooltip =
      pool.ticker == null ? (
        truncateStakePool(pool.id[0])
      ) : (
        <>
          [{pool.ticker}] {pool.name}
          <br />
          <span>{truncateStakePool(pool.id[0])}</span>
        </>
      );

    const poolInfo =
      pool.ticker == null ? (
        <div className={styles.poolInfo}>{truncateStakePool(pool.id[0])}</div>
      ) : (
        <div className={styles.poolInfo}>
          [{pool.ticker}] {pool.name}
        </div>
      );

    const img = <img alt="Pool avatar" src={avatar} className={styles.avatar} />;
    return (
      <CustomTooltip
        key={pool.id[0] + pool.id[1]}
        toolTip={<div className={styles.poolInfoToolTip}>{tooltip}</div>}
        placementTooltip="bottom"
        isPoolAvatar
      >
        <div className={styles.poolBox} key={pool.id[0] + pool.id[1]}>
          <div>
            {this.props.baseUrl != null ? (
              <a
                className={styles.url}
                href={this.props.baseUrl + pool.id[0]}
                onClick={event => this.props.onExternalLinkClick(event)}
              >
                {img}
              </a>
            ) : (
              img
            )}
          </div>
          {poolInfo}
        </div>
      </CustomTooltip>
    );
  };
}