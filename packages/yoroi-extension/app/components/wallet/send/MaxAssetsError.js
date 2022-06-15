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
      defaultMessage: '!!!<strong>{number} Assets</strong> is maximum number allowed to be send in one transaction',
    }
});

type Props = {|
  maxAssetsAllowed: number,
|}

export default class MaxAssetsError extends Component<Props> {
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
            <Typography variant='h5' marginBottom='3px'>
              {intl.formatMessage(globalMessages.errorLabel)}
            </Typography>
            <Typography color='var(--yoroi-palette-gray-900)'>
              <FormattedHTMLMessage
                {...messages.maxNumberAllowed}
                values={{ number: this.props.maxAssetsAllowed }}
              />
            </Typography>
          </Box>
        )
    }
}