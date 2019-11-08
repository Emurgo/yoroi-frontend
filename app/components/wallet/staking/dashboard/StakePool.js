// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import jdenticon from 'jdenticon';

import Card from './Card';
import ProgressCircle from './ProgressCircle';
import Address from './Address';
import styles from './StakePool.scss';

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
  margins: {
    id: 'wallet.dashboard.stakePool.margins',
    defaultMessage: '!!!Margins',
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
  rewards: {
    id: 'wallet.dashboard.stakePool.rewards',
    defaultMessage: '!!!Rewards',
  },
  age: {
    id: 'wallet.dashboard.stakePool.age',
    defaultMessage: '!!!Age',
  },
});

type Props = {|
  data: Object,
  poolName: string,
  hash: string,
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
        labelKey: 'performance',
        value: data.percentage + ' %',
      },
      {
        labelKey: 'fullness',
        value: data.fullness + ' %',
      },
      {
        labelKey: 'margins',
        value: data.margins + ' %',
      },
      {
        labelKey: 'created',
        value: data.created,
      },
      {
        labelKey: 'cost',
        value: data.cost + ' ADA',
      },
      {
        labelKey: 'stake',
        value: data.stake + ' ADA',
      },
      {
        labelKey: 'pledge',
        value: data.pledge + ' ADA',
      },
      {
        labelKey: 'rewards',
        value: data.rewards + ' ADA',
      },
      {
        labelKey: 'age',
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
                <li className={styles.row} key={v.labelKey}>
                  <span className={styles.label}>
                    {intl.formatMessage(messages[v.labelKey])}:
                  </span>
                  {v.value}
                </li>
              );
            })}
          </ul>
          <button type="button" className={styles.button}>
            {intl.formatMessage(messages.button)}
          </button>
        </div>
      </Card>
    );
  }

}
