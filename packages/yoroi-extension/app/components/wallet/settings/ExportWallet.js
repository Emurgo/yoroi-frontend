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
    id: 'wallet.settings.export.label',
    defaultMessage: '!!!Export wallet',
  },
  exportExplanation: {
    id: 'wallet.settings.export.explanation',
    defaultMessage: '!!!This can be used to transfer a wallet between devices.',
  },
});

type Props = {|
  +openDialog: void => void,
|};

@observer
export default class ExportWallet extends Component<Props> {
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
          component="div"
          variant="body1"
          fontWeight={500}
          mb="16px"
          color="grayscale.900"
        >
          {intl.formatMessage(messages.titleLabel)}
        </Typography>

        <Typography
          component="div"
          variant="body1"
          color="ds.text_gray_medium"
          mb="16px"
        >
          {intl.formatMessage(messages.exportExplanation)}
        </Typography>

        <Button
          variant="contained"
          size="flat"
          className="exportWallet"
          onClick={openDialog}
          sx={{
            marginTop: false,
            width: 'fit-content',
          }}
          id="settings:wallet-exportWallet-button"
        >
          {`${this.context.intl.formatMessage(globalMessages.exportButtonLabel)}`}
        </Button>
      </Box>
    );
  }
}
