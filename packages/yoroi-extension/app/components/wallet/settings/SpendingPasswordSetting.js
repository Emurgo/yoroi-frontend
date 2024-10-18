// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
// import styles from './SpendingPasswordSetting.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { Box, Button, Typography } from '@mui/material';

const messages = defineMessages({
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
  unchangedPassword: {
    id: 'wallet.settings.unchangedPassword',
    defaultMessage: '!!!Password unchanged since wallet creation',
  },
  title: {
    id: 'wallet.settings.password.title',
    defaultMessage: '!!!Wallet password',
  },
  passwordDescription: {
    id: 'wallet.settings.password.description',
    defaultMessage:
      '!!!Password is an additional security layer used to confirm transactions from this device. Password is stored locally, so you are only person who can change or restore it.',
  },
  changePassword: {
    id: 'wallet.settings.password.change',
    defaultMessage: '!!!Change password',
  },
});

type Props = {|
  +openDialog: void => void,
|};

@observer
export default class SpendingPasswordSetting extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Box mt="13px">
        <Typography component="div" variant="body1" fontWeight={500} color="grayscale.900" mb="16px">
          {intl.formatMessage(messages.title)}
        </Typography>

        <Typography component="div" variant="body1" color="ds.text_gray_medium" mb="16px">
          {intl.formatMessage(messages.passwordDescription)}
        </Typography>

        <Button
          onClick={this.props.openDialog}
          size="flat"
          variant="contained"
          color="primary"
          id="settings:wallet-changePassword-button"
        >
          {intl.formatMessage(messages.changePassword)}
        </Button>
      </Box>
    );
  }
}
