// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import styles from './PrivacyPolicy.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  header: {
    id: 'profile.privacypolicy.header',
    defaultMessage: '!!!Yoroi will...',
  },
  neverTrack: {
    id: 'profile.privacypolicy.neverTrack',
    defaultMessage: '!!!<strong>Never</strong> track your behavior.',
  },
  neverIP: {
    id: 'profile.privacypolicy.neverProfile',
    defaultMessage: '!!!<strong>Never</strong> create profiles with your information.',
  },
  neverSell: {
    id: 'profile.privacypolicy.neverSell',
    defaultMessage: '!!!<strong>Never</strong> sell your data.',
  },
  neverAnalytics: {
    id: 'profile.privacypolicy.neverAnalytics',
    defaultMessage: '!!!<strong>Never</strong> run any analytics software or 3rd party trackers.',
  },
  serverLogs: {
    id: 'profile.privacypolicy.serverLogs',
    defaultMessage: '!!!Any server log is kept for at most 2 weeks purely for server troubleshooting purposes.',
  },
});

type Props = {|
|};

@observer
export default class PrivacyPolicy extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
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
