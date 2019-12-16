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
import ProgressCircle from './ProgressCircle';
import Address from './Address';
import styles from './StakePool.scss';
import globalMessages from '../../../../i18n/global-messages';

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
    percentage: string,
    fullness: string,
    margins: string,
    created: string,
    cost: string,
    stake: string,
    pledge: string,
    rewards: string,
    age: string,
  |},
  +classicTheme: boolean,
  +poolName: string,
  +hash: string,
  +moreInfo: void | MoreInfoProp,
|};

@observer
export default class StakePool extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const { data, hash, poolName } = this.props;

    const avatarSource = jdenticon.toSvg(hash, 36, { padding: 0 });

    // Taken from Seiza (dangerouslyEmbedIntoDataURI())
    const avatar = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    const tableData = [
      {
        label: intl.formatMessage(messages.performance),
        value: data.percentage + ' %',
      },
      {
        label: intl.formatMessage(messages.fullness),
        value: data.fullness + ' %',
      },
      {
        label: intl.formatMessage(globalMessages.marginsLabel),
        value: data.margins + ' %',
      },
      {
        label: intl.formatMessage(messages.created),
        value: data.created,
      },
      {
        label: intl.formatMessage(messages.cost),
        value: data.cost + ' ADA',
      },
      {
        label: intl.formatMessage(messages.stake),
        value: data.stake + ' ADA',
      },
      {
        label: intl.formatMessage(messages.pledge),
        value: data.pledge + ' ADA',
      },
      {
        label: intl.formatMessage(globalMessages.rewardsLabel),
        value: data.rewards + ' ADA',
      },
      {
        label: intl.formatMessage(messages.age),
        value: data.age + ' Epochs',
      },
    ];

    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.head}>
          <div className={styles.avatarWrapper}>
            <img alt="User avatar" src={avatar} className={styles.avatar} />
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.userTitle}>{poolName}</h3>
            <Address hash={hash} />
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.chart}>
            <ProgressCircle percentage={25} text={intl.formatMessage(messages.circleText)} variant="stake" />
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
          </ul>
          {this.props.moreInfo && this.getMoreInfoButton(this.props.moreInfo)}
        </div>
      </Card>
    );
  }

  getMoreInfoButton: MoreInfoProp => Node = (info) => {
    const { intl } = this.context;

    const buttonClasses = classnames([
      styles.descriptionButton,
      this.props.classicTheme ? 'flat' : 'outlined',
    ]);
    return (
      <a
        href={info.url}
        onClick={info.openPoolPage}
      >
        <Button
          type="button"
          label={intl.formatMessage(messages.button)}
          className={buttonClasses}
          skin={ButtonSkin}
        />
      </a>
    );
  }
}
