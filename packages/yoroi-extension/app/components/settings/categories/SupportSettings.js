// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import { Box, Button, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
  +onExternalLinkClick: MouseEvent => void,
  +onDownloadLogs: void => void,
|};

@observer
export default class SupportSettings extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onExternalLinkClick, onDownloadLogs } = this.props;
    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
        id="settings:support-faq-link"
      >
        {intl.formatMessage(messages.faqLink)}
      </a>
    );

    const supportRequestLink = (
      <a
        href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335"
        onClick={event => onExternalLinkClick(event)}
        id="settings:support-requestSupport-link"
      >
        {intl.formatMessage(messages.supportRequestLink)}
      </a>
    );

    const downloadLogsLink = (
      <span role="button" tabIndex={0} onKeyPress={() => null} onClick={onDownloadLogs}>
        {intl.formatMessage(globalMessages.downloadLogsLink)}
      </span>
    );

    const sections = [
      {
        title: messages.faqTitle,
        text: <FormattedMessage {...messages.faqContent} values={{ faqLink }} />,
      },
      {
        title: messages.reportProblemTitle,
        text: <FormattedMessage {...messages.reportProblemContent} values={{ supportRequestLink }} />,
      },
      {
        title: messages.logsTitle,
        text: <FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} />,
      },
    ];

    return (
      <Box>
        <Typography component="h5" variant="h5" mb="24px" color="ds.text_gray_medium" fontWeight={500}>
          {intl.formatMessage(globalMessages.support)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}
        >
          {sections.map(({ title, text }) => {
            return (
              <Box key={title.id}>
                <Typography
                  component="div"
                  variant="body1"
                  color="ds.text_gray_medium"
                  fontWeight={500}
                  mb="8px"
                >
                  {intl.formatMessage(title)}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    '& a': {
                      color: 'ds.primary_500',
                      textDecoration: 'none',
                    },
                  }}
                  color="ds.text_gray_medium"
                  variant="body1"
                >
                  {text}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Button
          variant="contained"
          size="flat"
          onClick={onDownloadLogs}
          sx={{ marginTop: '40px' }}
          id="settings:support-downloadLogs-buttons"
        >
          {intl.formatMessage(globalMessages.downloadLogsButtonLabel)}
        </Button>
      </Box>
    );
  }
}
