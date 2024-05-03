// @flow
import type { Node, ComponentType } from 'react';
import { Box } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import { injectIntl, defineMessages } from 'react-intl';
import { ReactComponent as CoverBg } from '../../assets/images/transaction/wallet-empty-banner.inline.svg';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { observer } from 'mobx-react';

type Props = {|
  onBuySellClick: () => void,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  welcomeMessage: {
    id: 'wallet.emptyWalletMessage',
    defaultMessage: '!!!Your wallet is empty',
  },
  welcomeMessageSubtitle: {
    id: 'wallet.emptyWalletMessageSubtitle',
    defaultMessage: '!!!Top up your wallet safely using our trusted partners',
  },
});

function WalletEmptyBanner({ onBuySellClick, intl }: Props & Intl): Node {
  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.background.bg_gradient_1,
          marginBottom: '40px',
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '24px',
        }}
        id="walletEmptyBanner"
      >
        <Box sx={{ position: 'absolute', right: '10%', top: '-10%' }}>
          <CoverBg />
        </Box>
        <Box>
          <Typography component="div" variant="h3" color="ds.black_static" fontWeight={500} mb="8px">
            {intl.formatMessage(messages.welcomeMessage)}
          </Typography>
          <Typography
            component="div"
            variant="body1"
            color="ds.black_static"
            maxWidth="500px"
            mb="40px"
          >
            {intl.formatMessage(messages.welcomeMessageSubtitle)}
          </Typography>
        </Box>
        <Stack direction="row" gap="16px">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              '&.MuiButton-sizeMedium': {
                padding: '9px 25px',
                height: 'unset',
              },
            }}
            onClick={onBuySellClick}
          >
            <Typography
              component="div"
              variant="button2"
              fontWeight={500}
              sx={{
                lineHeight: '19px',
              }}
            >
              {intl.formatMessage(globalMessages.buyAda)}
            </Typography>
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(WalletEmptyBanner)): ComponentType<Props>);
