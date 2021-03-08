// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import SupportImg from '../assets/images/support.inline.svg';
import styles from './SupportPage.scss';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { handleExternalLinkClick } from '../../utils/routing';

type Props = {||};

const messages = defineMessages({
  supportText: {
    id: 'connector.settings.supportText',
    defaultMessage:
      '!!!Feel free to contact us, if you need some help or you have some other question.',
  },
  supportContact: {
    id: 'connector.settings.supportContact',
    defaultMessage: `!!!Yoroi team will get back to you soon.`,
  },
});

export default class SupportPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <SupportImg />
        <h3>{intl.formatMessage(messages.supportText)}</h3>
        <p>{intl.formatMessage(messages.supportContact)}</p>
        <a
          className={styles.link}
          href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
          onClick={event => handleExternalLinkClick(event)}
          rel="noopener noreferrer"
        >
          {intl.formatMessage(globalMessages.contactSupport)}
        </a>
      </div>
    );
  }
}
