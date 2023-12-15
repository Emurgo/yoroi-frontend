// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './Crashed.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import UnavailableDialog from '../widgets/UnavailableDialog';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import { Link, Typography } from '@mui/material';

const messages = defineMessages({
  title: {
    id: 'crash.screen.title',
    defaultMessage: '!!!Yoroi crashed',
  },
});

type Props = {|
  +onDownloadLogs: void => void,
|};

@observer
export default class Crashed extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <UnavailableDialog title={intl.formatMessage(messages.title)}>
        <div className={styles.body}>
          <div className={styles.attention}>
            {intl.formatMessage(globalMessages.attentionHeaderText)}
          </div>
          <br />
          <div className={styles.explanation}>{this._getErrorMessageComponent()}</div>
        </div>
      </UnavailableDialog>
    );
  }

  _getErrorMessageComponent: void => Node = () => {
    const { intl } = this.context;
    const { onDownloadLogs } = this.props;

    const downloadLogsLink = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link href="#" onClick={_event => onDownloadLogs()}>
        {intl.formatMessage(globalMessages.downloadLogsLink)}
      </Link>
    );

    const supportRequestLink = (
      <Link
        href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335"
        target="_blank"
        rel="noreferrer"
      >
        {intl.formatMessage(globalMessages.here)}
      </Link>
    );

    return (
      <div>
        <Typography component="div" sx={{ textAlign: 'justify', mb: '15px' }}>
          <FormattedMessage {...globalMessages.forMoreHelp} values={{ supportRequestLink }} />
        </Typography>

        <Typography component="div" variant="subtitle2" sx={{ textAlign: 'justify' }}>
          <FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} />
        </Typography>
      </div>
    );
  };
}
