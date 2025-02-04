// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.remove.label',
    defaultMessage: '!!!Remove wallet',
  },
  removeExplanation: {
    id: 'wallet.settings.remove.explanation',
    defaultMessage: '!!!Removing a wallet does not affect the wallet balance. Your wallet can be restored again at any time.',
  },
});

type Props = {|
  +walletName: string,
  +openDialog: void => void,
|};

@observer
export default class RemoveWallet extends Component<Props> {
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
          mt: '20px',
          pt: false,
          borderTop: false,
          borderColor: false,
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
          {intl.formatMessage(messages.removeExplanation)}
        </Typography>

        <Button
          variant="contained"
          size="flat"
          color="error"
          className="removeWallet"
          onClick={openDialog}
          sx={{
            marginTop: false,
            width: 'fit-content',
          }}
          id="settings:wallet-removeWallet-button"
        >
          {`${this.context.intl.formatMessage(globalMessages.remove)} ${this.props.walletName}`}
        </Button>
      </Box>
    );
  }
}
