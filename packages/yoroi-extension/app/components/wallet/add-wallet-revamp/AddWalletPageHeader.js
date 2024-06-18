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
          <Button
            sx={{ color: 'grayscale.900', lineHeight: '27px',fontSize: '14px' }}
            startIcon={<BackIcon />}
            onClick={goToCurrentWallet}
          >
            {intl.formatMessage(messages.backButtonLabel)}
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
          <Typography component="div" variant="h1" fontWeight={500} color="primary.600" mb="8px">
            {intl.formatMessage(globalMessages.yoroi)}
          </Typography>
          <Typography component="div" variant="body1" fontWeight={500} color="primary.600">
            {intl.formatMessage(globalMessages.yoroiIntro)}
          </Typography>
        </Box>
      </Box>
    );
  }
}
