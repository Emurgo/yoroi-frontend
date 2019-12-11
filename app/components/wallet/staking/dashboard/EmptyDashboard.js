// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import EmptyIllustration from '../../../../assets/images/dashboard/empty-dashboard.inline.svg';
import styles from './EmptyDashboard.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.empty.title',
    defaultMessage: '!!!You have not delegated your ADA yet',
  },
  text: {
    id: 'wallet.dashboard.empty.text',
    defaultMessage: '!!!Go to Simple or Advance Staking to choce what stake pool you want to delegate in. Note, you may delegate only to one stake pool in this Tesnnet'
  }
});

type Props = {|
|};

@observer
export default class EmptyDashboard extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.wrapper}>
        <EmptyIllustration />
        <div className={styles.text}>
          <h3 className={styles.title}>{intl.formatMessage(messages.title)}</h3>
          <p className={styles.paragraph}>{intl.formatMessage(messages.text)}</p>
        </div>
      </div>
    );
  }
}
