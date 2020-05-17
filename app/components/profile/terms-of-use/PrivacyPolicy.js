// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import styles from './PrivacyPolicy.scss';

const messages = defineMessages({
  header: {
    id: 'profile.privacypolicy.header',
    defaultMessage: '!!!Yoroi will...',
  },
  neverTrack: {
    id: 'profile.privacypolicy.neverTrack',
    defaultMessage: '!!!<strong>Never</strong> collect keys, addresses, transactions, balances, hashes, or any personal information',
  },
  neverIP: {
    id: 'profile.privacypolicy.neverIP',
    defaultMessage: '!!!<strong>Never</strong> collect your IP address',
  },
  neverSell: {
    id: 'profile.privacypolicy.neverSell',
    defaultMessage: '!!!<strong>Never</strong> sell your data',
  },
  neverAnalytics: {
    id: 'profile.privacypolicy.neverAnalytics',
    defaultMessage: '!!!<strong>Never</strong> run any analytics software or 3rd party trackers',
  },
  serverLogs: {
    id: 'profile.privacypolicy.serverLogs',
    defaultMessage: '!!!Any server log is kept for at most 2 weeks purely for server troubleshooting purposes',
  },
});

type Props = {|
|};

@observer
export default class PrivacyPolicy extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.text}>
          {intl.formatMessage(messages.header)}
          <ul>
            <li><FormattedHTMLMessage {...messages.neverTrack} /></li>
            <li><FormattedHTMLMessage {...messages.neverIP} /></li>
            <li><FormattedHTMLMessage {...messages.neverSell} /></li>
            <li><FormattedHTMLMessage {...messages.neverAnalytics} /></li>
          </ul>
          {intl.formatMessage(messages.serverLogs)}
        </div>
      </div>
    );
  }

}
