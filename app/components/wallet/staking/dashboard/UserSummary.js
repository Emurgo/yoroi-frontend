// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Card from './Card';
import styles from './UserSummary.scss';
import IconAda from '../../../../assets/images/dashboard/total-ada.inline.svg';
import IconRewards from '../../../../assets/images/dashboard/total-rewards.inline.svg';
import IconDelegated from '../../../../assets/images/dashboard/total-delegated.inline.svg';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.summary.title',
    defaultMessage: '!!!Your Summary',
  },
  adaLabel: {
    id: 'wallet.dashboard.summary.adaTitle',
    defaultMessage: '!!!Total ADA',
  },
  rewardsLabel: {
    id: 'wallet.dashboard.summary.rewardsTitle',
    defaultMessage: '!!!Total Rewards',
  },
  delegatedLabel: {
    id: 'wallet.dashboard.summary.delegatedTitle',
    defaultMessage: '!!!Total Delegated',
  }
});

type Props = {|
  totalAdaSum: string,
  totalRewards: string,
  totalDelegated: string,
|};

@observer
export default class UserSummary extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { totalAdaSum, totalRewards, totalDelegated } = this.props;
    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          <div className={styles.column}>
            <div className={styles.icon}>
              <IconAda />
            </div>
            <h3 className={styles.label}>
              {intl.formatMessage(messages.adaLabel)}:
            </h3>
            <p className={styles.value}>{totalAdaSum} ADA</p>
          </div>
          <div className={styles.column}>
            <div className={styles.icon}>
              <IconRewards />
            </div>
            <h3 className={styles.label}>
              {intl.formatMessage(messages.rewardsLabel)}:
            </h3>
            <p className={styles.value}>{totalRewards} ADA</p>
          </div>
          <div className={styles.column}>
            <div className={styles.icon}>
              <IconDelegated />
            </div>
            <h3 className={styles.label}>
              {intl.formatMessage(messages.delegatedLabel)}:
            </h3>
            <p className={styles.value}>{totalDelegated} ADA</p>
          </div>
        </div>
      </Card>
    );
  }
}
