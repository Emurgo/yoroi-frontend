// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Card from './Card';
import styles from './UserSummary.scss';
import IconAda from '../../../../assets/images/dashboard/total-ada.inline.svg';
import IconRewards from '../../../../assets/images/dashboard/total-rewards.inline.svg';
import IconDelegated from '../../../../assets/images/dashboard/total-delegated.inline.svg';
import globalMessages from '../../../../i18n/global-messages';

import LoadingSpinner from '../../../widgets/LoadingSpinner';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.summary.title',
    defaultMessage: '!!!Your Summary',
  },
  rewardsLabel: {
    id: 'wallet.dashboard.summary.rewardsTitle',
    defaultMessage: '!!!Total Rewards',
  },
  delegatedLabel: {
    id: 'wallet.dashboard.summary.delegatedTitle',
    defaultMessage: '!!!Total Delegated',
  },
  note: {
    id: 'wallet.dashboard.summary.note',
    defaultMessage: '!!!Less than you expected?',
  },
});

type Props = {|
  +totalAdaSum: void | string,
  +totalRewards: void | string,
  +totalDelegated: void | string,
  +openLearnMore: void => void,
|};

@observer
export default class UserSummary extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          {this.getTotalAda()}
          {this.getTotalRewards()}
          {this.getTotalDelegated()}
        </div>
      </Card>
    );
  }

  getTotalAda: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.column}>
        <div className={styles.icon}>
          <IconAda />
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(globalMessages.totalAdaLabel)}:
        </h3>
        {this.props.totalAdaSum != null
          ? (<p className={styles.value}>{this.props.totalAdaSum} ADA</p>)
          : (<LoadingSpinner small />)
        }
      </div>
    );
  }

  getTotalRewards: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.column}>
        <div className={styles.icon}>
          <IconRewards />
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(messages.rewardsLabel)}:
        </h3>
        {this.props.totalRewards != null
          ? (
            <>
              <p className={styles.value}>
                {this.props.totalRewards} ADA
              </p>
              {/* <span
                className={styles.note}
                role="button"
                tabIndex={0}
                onKeyPress={() => null}
                onClick={this.props.openLearnMore}
              >
                {intl.formatMessage(messages.note)}
              </span> */}
            </>
          )
          : (<LoadingSpinner small />)
        }
      </div>
    );
  }

  getTotalDelegated: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.column}>
        <div className={styles.icon}>
          <IconDelegated />
        </div>
        <h3 className={styles.label}>
          {intl.formatMessage(messages.delegatedLabel)}:
        </h3>
        {this.props.totalDelegated != null
          ? (<p className={styles.value}>{this.props.totalDelegated} ADA</p>)
          : (<LoadingSpinner small />)
        }
      </div>
    );
  }
}
