// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as StarIcon }  from '../../assets/images/add-wallet/wallet-list/stared.inline.svg';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

const messages = defineMessages({
  quickAccess: {
    id: 'wallet.nav.noWalletsAccessList.quickAccess',
    defaultMessage: '!!!Quick access wallets',
  },
});

type Props = {||};

@observer
export default class QuickAccessListheader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Box sx={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
          '& > svg': { marginRight: '8px' }
      }}
      >
        <StarIcon />
        <Typography
          variant='h3'
          fontSize='24px'
          color='var(--yoroi-palette-gray-900)'
          lineHeight='30px'
        >{intl.formatMessage(messages.quickAccess)}
        </Typography>
      </Box>
    );
  }
}
