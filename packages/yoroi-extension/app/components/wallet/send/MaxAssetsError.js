// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';


const messages = defineMessages({
    maxNumberAllowed: {
      id: 'wallet.send.form.dialog.maxNumberAllowed',
      defaultMessage: '!!!<bold>10 Assets</bold> is maximum number allowed to be send in one transaction',
    }
});

export default class MaxAssetsError extends Component<{||}> {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;

        return (
          <Box
            sx={{
              boxShadow: 'var(--yoroi-warning-box-bg-shadow)',
              color: 'var(--yoroi-palette-error-200)',
              backgroundColor: 'rgba(255, 19, 81, 0.06)',
              padding: '16px',
              borderRadius: '8px'
            }}
          >
            <Typography variant='h5'>
              {intl.formatMessage(globalMessages.errorLabel)}
            </Typography>
            <Typography>
              <FormattedHTMLMessage {...messages.maxNumberAllowed} />
            </Typography>
          </Box>
        )
    }
}