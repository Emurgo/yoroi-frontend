// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import styles from './SupportSettings.scss';

const messages = defineMessages({
  faqTitle: {
    id: 'settings.support.faq.title',
    defaultMessage: '!!!Frequently asked questions',
    description: 'Title "Frequently asked questions" on the support settings page.',
  },
  faqContent: {
    id: 'settings.support.faq.content',
    defaultMessage: '!!!If you are experiencing issues, please see the {faqLink} for guidance on known issues.',
    description: 'Content for the "Frequently asked questions" section on the support settings page.',
  },
  faqLink: {
    id: 'settings.support.faq.faqLink',
    defaultMessage: '!!!FAQ on Daedalus website',
    description: '"FAQ on Daedalus website" link in the FAQ section on the support settings page',
  },
  faqLinkUrl: {
    id: 'settings.support.faq.faqLinkURL',
    defaultMessage: '!!!https://daedaluswallet.io/faq/',
    description: 'URL for the "FAQ on Daedalus website" link in the FAQ section on the support settings page',
  },
  reportProblemTitle: {
    id: 'settings.support.reportProblem.title',
    defaultMessage: '!!!Reporting a problem',
    description: 'Title "Reporting a problem" on the support settings page.',
  },
  reportProblemContent: {
    id: 'settings.support.reportProblem.content',
    defaultMessage: '!!!If the FAQ does not solve the issue you are experiencing, please use our {supportRequestLink} feature.',
    description: 'Content for the "Reporting a problem" section on the support settings page.',
  },
  supportRequestLink: {
    id: 'settings.support.reportProblem.link',
    defaultMessage: '!!!Support request',
    description: '"Support request" link in the "Report a problem" section on the support settings page.',
  },
  supportRequestLinkUrl: {
    id: 'settings.support.faq.supportRequestLinkURL',
    defaultMessage: '!!!https://zendesk.com/support/',
    description: 'URL for the "Support Request" link in the Support section on the support settings page',
  },
});

type Props = {
  onExternalLinkClick: Function
};

@observer
export default class SupportSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { onExternalLinkClick } = this.props;
    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(messages.faqLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.faqLink)}
      </a>
    );

    const supportRequestLink = (
      <a
        href={intl.formatMessage(messages.supportRequestLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.supportRequestLink)}
      </a>
    );

    return (
      <div className={styles.component}>

        <h1>{intl.formatMessage(messages.faqTitle)}</h1>

        <p><FormattedMessage {...messages.faqContent} values={{ faqLink }} /></p>

        <h1>{intl.formatMessage(messages.reportProblemTitle)}</h1>

        <p>
          <FormattedMessage {...messages.reportProblemContent} values={{ supportRequestLink }} />
        </p>

      </div>
    );
  }

}
