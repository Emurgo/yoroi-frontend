// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './SupportSettings.scss';

const messages = defineMessages({
  faqTitle: {
    id: 'settings.support.faq.title',
    defaultMessage: '!!!Frequently asked questions',
  },
  faqContent: {
    id: 'settings.support.faq.content',
    defaultMessage: '!!!If you are experiencing issues, please see the {faqLink} for guidance on known issues.',
  },
  faqLink: {
    id: 'settings.support.faq.faqLink',
    defaultMessage: '!!!FAQ on Yoroi website',
  },
  reportProblemTitle: {
    id: 'settings.support.reportProblem.title',
    defaultMessage: '!!!Reporting a problem',
  },
  reportProblemContent: {
    id: 'settings.support.reportProblem.content',
    defaultMessage: '!!!If the FAQ does not solve the issue you are experiencing, please use our {supportRequestLink} feature.',
  },
  supportRequestLink: {
    id: 'settings.support.reportProblem.link',
    defaultMessage: '!!!Support request',
  },
  supportRequestLinkUrl: {
    id: 'settings.support.faq.supportRequestLinkURL',
    defaultMessage: '!!!https://zendesk.com/support/',
  },
  logsTitle: {
    id: 'settings.support.logs.title',
    defaultMessage: '!!!Logs',
  },
  logsContent: {
    id: 'settings.support.logs.content',
    defaultMessage: '!!!If you want to inspect logs, you can {downloadLogsLink}. Logs do not contain sensitive information, and it would be helpful to attach them to problem reports to help the team investigate the issue you are experiencing. Logs can be attached automatically when using the bug reporting feature.',
  },
  downloadLogsLink: {
    id: 'settings.support.logs.downloadLogsLink',
    defaultMessage: '!!!download them here',
  },
});

type Props = {
  onExternalLinkClick: Function,
  onDownloadLogs: Function,
};

@observer
export default class SupportSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { onExternalLinkClick, onDownloadLogs } = this.props;
    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
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

    const downloadLogsLink = (
      <button type="button" onClick={onDownloadLogs}>
        {intl.formatMessage(messages.downloadLogsLink)}
      </button>
    );

    return (
      <div className={styles.component}>
        <h1>{intl.formatMessage(messages.faqTitle)}</h1>

        <p><FormattedMessage {...messages.faqContent} values={{ faqLink }} /></p>

        <h1>{intl.formatMessage(messages.reportProblemTitle)}</h1>

        <p>
          <FormattedMessage {...messages.reportProblemContent} values={{ supportRequestLink }} />
        </p>

        <h1>{intl.formatMessage(messages.logsTitle)}</h1>

        <p><FormattedMessage {...messages.logsContent} values={{ downloadLogsLink }} /></p>

      </div>
    );
  }

}
