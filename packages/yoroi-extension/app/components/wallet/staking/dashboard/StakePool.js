// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { toSvg } from 'jdenticon';

import { Button } from '@mui/material';

import CardShadow from './CardShadow';
import type { Notification } from '../../../../types/notification.types';
import CopyableAddress from '../../../widgets/CopyableAddress';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import styles from './StakePool.scss';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { truncateStakePool } from '../../../../utils/formatters';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.stakePool.title',
    defaultMessage: '!!!Stake Pool Delegated',
  },
  circleText: {
    id: 'wallet.dashboard.stakePool.circleText',
    defaultMessage: '!!!Revenue',
  },
  viewWebpage: {
    id: 'wallet.dashboard.stakePool.viewWebpage',
    defaultMessage: '!!!View pool webpage',
  },
  description: {
    id: 'wallet.dashboard.stakePool.descriptionButton',
    defaultMessage: '!!!Description',
  },
  performance: {
    id: 'wallet.dashboard.stakePool.performance',
    defaultMessage: '!!!Performance',
  },
  fullness: {
    id: 'wallet.dashboard.stakePool.fullness',
    defaultMessage: '!!!Fullness',
  },
  created: {
    id: 'wallet.dashboard.stakePool.created',
    defaultMessage: '!!!Created',
  },
  cost: {
    id: 'wallet.dashboard.stakePool.cost',
    defaultMessage: '!!!Cost',
  },
  stake: {
    id: 'wallet.dashboard.stakePool.stake',
    defaultMessage: '!!!Stake',
  },
  pledge: {
    id: 'wallet.dashboard.stakePool.pledge',
    defaultMessage: '!!!Pledge',
  },
  age: {
    id: 'wallet.dashboard.stakePool.age',
    defaultMessage: '!!!Age',
  },
});

type MoreInfoProp = {|
  openPoolPage: MouseEvent => void,
  url: string,
|};

type Props = {|
  +data: {|
    description?: string,
    // percentage: string,
    // fullness: string,
    // margins: string,
    // created: string,
    // cost: string,
    // stake: string,
    // pledge: string,
    // rewards: string,
    // age: string,
  |},
  +classicTheme: boolean,
  +poolName: string,
  +hash: string,
  +moreInfo: void | MoreInfoProp,
  +selectedExplorer: SelectedExplorer,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  /**
   * we don't allow to undelegate if the user is using ratio stake
   * since the UX in this case is not obvious (undelegate from one pool or all pools)
  */
  +undelegate: void | (void => Promise<void>),
  +purpose: 'dashboard' | 'delegation',
|};

@observer
export default class StakePool extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const { hash, poolName } = this.props;

    const avatarSource = toSvg(hash, 36, { padding: 0 });

    // Taken from Seiza (dangerouslyEmbedIntoDataURI())
    const avatar = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    // const tableData = [
    //   {
    //     label: intl.formatMessage(messages.performance),
    //     value: data.percentage + ' %',
    //   },
    //   {
    //     label: intl.formatMessage(messages.fullness),
    //     value: data.fullness + ' %',
    //   },
    //   {
    //     label: intl.formatMessage(globalMessages.marginsLabel),
    //     value: data.margins + ' %',
    //   },
    //   {
    //     label: intl.formatMessage(messages.created),
    //     value: data.created,
    //   },
    //   {
    //     label: intl.formatMessage(messages.cost),
    //     value: `${data.cost} ${ticker}`,
    //   },
    //   {
    //     label: intl.formatMessage(messages.stake),
    //     value: `${data.stake} ${ticker}`,
    //   },
    //   {
    //     label: intl.formatMessage(messages.pledge),
    //     value: `${data.pledge} ${ticker}`,
    //   },
    //   {
    //     label: intl.formatMessage(globalMessages.rewardsLabel),
    //     value: `${data.reward} ${ticker}`,
    //   },
    //   {
    //     label: intl.formatMessage(messages.age),
    //     value: data.age + ' Epochs',
    //   },
    // ];

    const poolIdNotificationId = 'poolId-copyNotification';
    return (
      <CardShadow title={
        this.props.purpose === 'dashboard'
          ? intl.formatMessage(messages.title)
          : undefined}
      >
        <div className={styles.head}>
          <div className={styles.avatarWrapper}>
            <img alt="User avatar" src={avatar} className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.userTitle}>{poolName}</h3>
            <div className={styles.subTitle}>
              <CopyableAddress
                id='stakePool'
                hash={hash}
                elementId={poolIdNotificationId}
                onCopyAddress={() => this.props.onCopyAddressTooltip(hash, poolIdNotificationId)}
                notification={this.props.notification}
                placementTooltip="bottom-start"
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={hash}
                  light
                  linkType="pool"
                >
                  <RawHash light>
                    <span className={styles.hash}>{
                      truncateStakePool(hash)
                    }
                    </span>
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
            </div>
          </div>
        </div>
        <div className={styles.wrapper}>
          {/* <div className={styles.chart}>
            <ProgressCircle
              percentage={25}
              text={intl.formatMessage(messages.circleText)}
              variant="stake"
            />
          </div>
          <ul className={styles.data}>
            {tableData.map((v) => {
              return (
                <li className={styles.row} key={v.label}>
                  <span className={styles.label}>
                    {v.label}:
                  </span>
                  {v.value}
                </li>
              );
            })}
          </ul> */}
          {this.props.purpose === 'delegation'
            ? <span className={styles.description}>{this.props.data.description}</span>
            : undefined
          }
          {this.getMoreInfoButton(this.props.moreInfo)}
        </div>
      </CardShadow>
    );
  }

  getMoreInfoButton: (?MoreInfoProp) => Node = info => {
    const { intl } = this.context;

    return (
      <>
        {info != null && (
          <a href={info.url} onClick={info.openPoolPage}>
            <div className={styles.data} />
            <Button variant="secondary">{intl.formatMessage(messages.viewWebpage)}</Button>
          </a>
        )}
        {this.props.undelegate != null && (
          <>
            <div className={styles.data} />
            <Button variant="secondary" onClick={this.props.undelegate}>
              {intl.formatMessage(globalMessages.undelegateLabel)}
            </Button>
          </>
        )}
      </>
    );
  };
}
