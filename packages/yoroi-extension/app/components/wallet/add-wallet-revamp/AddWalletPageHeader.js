// @flow

import { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Typography, Box, Button } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as BackIcon } from '../../../assets/images/assets-page/backarrow.inline.svg';

const messages: * = defineMessages({
  subtitle: {
    id: 'wallet.add.page.revamp.subtitle',
    defaultMessage: '!!!Light wallet for Cardano assets',
  },
  backButtonLabel: {
    id: 'wallet.add.page.revamp.backButtonLabel',
    defaultMessage: '!!!Back to current wallet',
  },
});

type Props = {|
  +goToCurrentWallet: void => void,
  +hasAnyWallets: boolean,
|};

@observer
export default class AddWalletPageHeader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { goToCurrentWallet, hasAnyWallets } = this.props;

    return (
      <Box>
        {hasAnyWallets && (
          <Button sx={{ color: 'gray.900' }} onClick={goToCurrentWallet}>
            <Box mr="10px">
              <BackIcon />
            </Box>
            <Typography variant="button2" fontWeight={500} color="gray.900">
              {intl.formatMessage(messages.backButtonLabel)}
            </Typography>
          </Button>
        )}
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
          <Typography variant="h1" fontWeight={500} color="primary.600" mb="8px">
            {intl.formatMessage(globalMessages.yoroi)}
          </Typography>
          <Typography variant="body1" fontWeight={500} color="primary.600">
            {intl.formatMessage(messages.subtitle)}
          </Typography>
        </Box>
      </Box>
    );
  }
}
