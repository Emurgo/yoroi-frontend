// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import jdenticon from 'jdenticon';
import classnames from 'classnames';

import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

import Card from './Card';
// import ProgressCircle from './ProgressCircle';
import type { Notification } from '../../../../types/notificationType';
import CopyableAddress from '../../../widgets/CopyableAddress';
import RawHash from '../../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../../containers/widgets/ExplorableHashContainer';
import styles from './StakePool.scss';
import type { ExplorerType } from '../../../../domain/Explorer';
import type { ReputationObject } from '../../../../api/ada/lib/state-fetch/types';
import globalMessages from '../../../../i18n/global-messages';
import WarningIcon from '../../../../assets/images/attention-modern.inline.svg';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.stakePool.title',
    defaultMessage: '!!!Stake Pool Delegated',
  },
  circleText: {
    id: 'wallet.dashboard.stakePool.circleText',
    defaultMessage: '!!!Revenue',
  },
  button: {
    id: 'wallet.dashboard.stakePool.descriptionButton',
    defaultMessage: '!!!Full description',
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
  +selectedExplorer: ExplorerType,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  /**
   * we don't allow to undelegate if the user is using ratio stake
   * since the UX in this case is not obvious (undelegate from one pool or all pools)
  */
  +undelegate: void | (void => Promise<void>),
  +isUndelegating: boolean,
  +reputationInfo: ReputationObject,
  +openReputationDialog: void => void,
|};

@observer
export default class StakePool extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const { hash, poolName } = this.props;

    const avatarSource = jdenticon.toSvg(hash, 36, { padding: 0 });

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
    //     value: data.cost + ' ADA',
    //   },
    //   {
    //     label: intl.formatMessage(messages.stake),
    //     value: data.stake + ' ADA',
    //   },
    //   {
    //     label: intl.formatMessage(messages.pledge),
    //     value: data.pledge + ' ADA',
    //   },
    //   {
    //     label: intl.formatMessage(globalMessages.rewardsLabel),
    //     value: data.rewards + ' ADA',
    //   },
    //   {
    //     label: intl.formatMessage(messages.age),
    //     value: data.age + ' Epochs',
    //   },
    // ];

    const poolIdNotificationId = 'poolId-copyNotification';

    const poolWarning = (this.props.reputationInfo.node_flags ?? 0) === 0
      ? null
      : (
        <div className={styles.warningIcon}>
          <WarningIcon onClick={this.props.openReputationDialog} />
        </div>
      );

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.head}>
          <div className={styles.avatarWrapper}>
            <img alt="User avatar" src={avatar} className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.userTitle}>{poolName}</h3>
            <div className={styles.subTitle}>
              {poolWarning}
              <CopyableAddress
                hash={hash}
                elementId={poolIdNotificationId}
                onCopyAddress={() => this.props.onCopyAddressTooltip(hash, poolIdNotificationId)}
                notification={this.props.notification}
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={hash}
                  light
                  linkType="pool"
                >
                  <RawHash light>
                    <span className={styles.hash}>{
                      hash.substring(0, 6) + '...' + hash.substring(hash.length - 6, hash.length)
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
          {this.props.moreInfo && this.getMoreInfoButton(this.props.moreInfo)}
        </div>
      </Card>
    );
  }

  getMoreInfoButton: MoreInfoProp => Node = (info) => {
    const { intl } = this.context;

    const moreInfoButtonClasses = classnames([
      this.props.classicTheme ? 'flat' : 'outlined',
    ]);
    const undelegateButtonClasses = classnames([
      this.props.classicTheme ? 'flat' : 'outlined',
      this.props.isUndelegating ? styles.submitButtonSpinning : null,
    ]);
    return (
      <>
        <a
          href={info.url}
          onClick={info.openPoolPage}
        >
          <Button
            type="button"
            label={intl.formatMessage(messages.button)}
            className={moreInfoButtonClasses}
            skin={ButtonSkin}
          />
        </a>
        {this.props.undelegate != null &&
          <>
            <div className={styles.data} />
            <Button
              type="button"
              label={intl.formatMessage(globalMessages.undelegateLabel)}
              className={undelegateButtonClasses}
              skin={ButtonSkin}
              onClick={this.props.undelegate}
              disabled={this.props.isUndelegating}
            />
          </>
        }
      </>
    );
  }
}
