// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import styles from './SupportSettings.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';

const messages = defineMessages({
  faqTitle: {
    id: 'settings.support.faq.title',
    defaultMessage: '!!!Frequently asked questions',
  },
  faqContent: {
    id: 'settings.support.faq.content',
    defaultMessage:
      '!!!If you are experiencing issues, please see the {faqLink} for guidance on known issues.',
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
    defaultMessage:
      '!!!If the FAQ does not solve the issue you are experiencing, please use our {supportRequestLink} feature.',
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
  +onExternalLinkClick: MouseEvent => void,
  +onDownloadLogs: void => void,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class SupportSettings extends Component<Props & InjectedProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onExternalLinkClick, onDownloadLogs, isRevampLayout } = this.props;
    const { intl } = this.context;

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
        href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335"
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

        <p>
          <FormattedMessage {...messages.faqContent} values={{ faqLink }} />
        </p>

        <h1>{intl.formatMessage(messages.reportProblemTitle)}</h1>

        <p>
          <FormattedMessage {...messages.reportProblemContent} values={{ supportRequestLink }} />
        </p>

        <h1>{intl.formatMessage(messages.logsTitle)}</h1>

        <p>
          <FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} />
        </p>

        <Button
          variant={isRevampLayout ? 'contained' : 'primary'}
          onClick={onDownloadLogs}
          sx={{ marginTop: '20px' }}
        >
          {intl.formatMessage(globalMessages.downloadLogsButtonLabel)}
        </Button>
      </div>
    );
  }
}

export default (withLayout(SupportSettings): ComponentType<Props>);
