// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Card from './Card';
import styles from './RewardPopup.scss';

const messages = defineMessages({
  current: {
    id: 'wallet.dashboard.rewards.current',
    defaultMessage: '!!!Next reward',
  },
  following: {
    id: 'wallet.dashboard.rewards.following',
    defaultMessage: '!!!Following rewards',
  },
  note: {
    id: 'wallet.dashboard.rewards.note',
    defaultMessage: '!!!The first reward is slower.',
  },
  learnMore: {
    id: 'wallet.dashboard.rewards.learnMore',
    defaultMessage: '!!!Learn more here.',
  },
});

type Props = {|
  currentText: string,
  followingText: string,
|};

@observer
export default class RewardPopup extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { currentText, followingText } = this.props;

    // TODO: real link
    const learnMoreLink = '#';
    return (
      <div>
        <Card>
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.column}>
                <h3 className={styles.label}>{intl.formatMessage(messages.current)}:</h3>
                <p>{currentText}</p>
              </div>
              <div className={styles.column}>
                <h3 className={styles.label}>{intl.formatMessage(messages.following)}:</h3>
                <p>{followingText}</p>
              </div>
            </div>
          </div>
        </Card>
        <p className={styles.note}>
          {intl.formatMessage(messages.note)}{' '}
          <a href={learnMoreLink} className={styles.link}>
            {intl.formatMessage(messages.learnMore)}
          </a>
        </p>
      </div>
    );
  }

}
