// @flow

import { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg'
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Typography, Box } from '@mui/material'
import globalMessages from '../../../i18n/global-messages';


const messages: * = defineMessages({
    subtitle: {
        id: 'wallet.add.page.revamp.subtitle',
        defaultMessage: '!!!Light wallet for Cardano assets',
    }
});

@observer
export default class AddWalletPageHeader extends Component<{||}> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            width: '56px',
            height: '48px',
            mb: '24px',
          }}
        >
          <img src={YoroiLogo} alt="Yoroi" />
        </Box>
        <Typography variant='h1' color='primary' mb='8px'>{intl.formatMessage(globalMessages.yoroi)}</Typography>
        <Typography variant='body1' color='primary'>{intl.formatMessage(messages.subtitle)}</Typography>
      </Box>
    )
  }
}