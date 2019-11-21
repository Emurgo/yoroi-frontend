// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
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
  logsTitle: {
    id: 'settings.support.logs.title',
    defaultMessage: '!!!Logs',
  },
});

type Props = {|
  +onExternalLinkClick: Function,
  +onDownloadLogs: Function,
|};

@observer
export default class SupportSettings extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { onExternalLinkClick, onDownloadLogs } = this.props;
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.downloadButton
    ]);

    const faqLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.faqLink)}
      </a>
    );

    const supportRequestLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.supportRequestLink)}
      </a>
    );

    const downloadLogsLink = (
      <span
        role="button"
        tabIndex={0}
        onKeyPress={() => null}
        className={styles.link}
        onClick={onDownloadLogs}
      >
        {intl.formatMessage(globalMessages.downloadLogsLink)}
      </span>
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

        <p><FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} /></p>

        <Button
          className={buttonClasses}
          label={intl.formatMessage(globalMessages.downloadLogsButtonLabel)}
          onClick={onDownloadLogs}
          skin={ButtonSkin}
        />

      </div>
    );
  }

}
