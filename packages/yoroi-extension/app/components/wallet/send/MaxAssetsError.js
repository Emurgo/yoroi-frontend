// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as AttentionIcon } from '../../../assets/images/attention-modern.inline.svg';

const messages = defineMessages({
  maxNumberAllowed: {
    id: 'wallet.send.form.dialog.maxNumberAllowed',
    defaultMessage: '!!!<strong>{number} Assets</strong> is maximum number allowed to be send in one transaction',
  },
});

type Props = {|
  maxAssetsAllowed: number,
|};

export default class MaxAssetsError extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Box sx={{ backgroundColor: 'ds.sys_magenta_100', padding: '12px 16px', borderRadius: '8px' }}>
        <Stack direction="row" gap="8px">
          <AttentionIcon />
          <Typography component="div" fontWeight={500} variant="body1" color="ds.sys_magenta_500" marginBottom="8px">
            {intl.formatMessage(globalMessages.errorLabel)}
          </Typography>
        </Stack>
        <Typography component="div" variant="body1" color="grayscale.900">
          <FormattedHTMLMessage {...messages.maxNumberAllowed} values={{ number: this.props.maxAssetsAllowed }} />
        </Typography>
      </Box>
    );
  }
}
