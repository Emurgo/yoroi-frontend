// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.resync.label',
    defaultMessage: '!!!Resync wallet with the blockchain',
  },
  resyncExplanation: {
    id: 'wallet.settings.resync.explanation',
    defaultMessage:
      '!!!If you are experiencing issues with your wallet, or think you have an incorrect balance or transaction history, you can delete the local data stored by Yoroi and resync with the blockchain.',
  },
});

type Props = {|
  openDialog: void => void,
|};

@observer
export default class ResyncBlock extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { openDialog } = this.props;

    return (
      <Box
        sx={{
          pb: '20px',
          mt: '40px',
          pt: false,
          borderTop: false,
        }}
      >
        <Typography
          variant="body1"
          fontWeight={500}
          mb="16px"
          color="grayscale.900"
        >
          {intl.formatMessage(messages.titleLabel)}
        </Typography>
        <Typography
          variant="body1"
          color="ds.text_gray_medium"
          mb="16px"
        >
          {intl.formatMessage(messages.resyncExplanation)}
        </Typography>

        <Button
          variant="contained"
          size="flat"
          className="resyncButton"
          onClick={openDialog}
          sx={{
            marginTop: false,
            width: 'fit-content',
          }}
          id="settings:wallet-resyncWallet-button"
        >
          {this.context.intl.formatMessage(globalMessages.resyncButtonLabel)}
        </Button>
      </Box>
    );
  }
}
