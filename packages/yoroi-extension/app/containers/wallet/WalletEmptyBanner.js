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
  goToReceivePage: () => void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  welcomeMessage: {
    id: 'wallet.transaction.welcomeMessage',
    defaultMessage: '!!!Welcome to Yoroi',
  },
  welcomeMessageSubtitle: {
    id: 'wallet.transaction.welcomeMessageSubtitle',
    defaultMessage:
      '!!!With new features and upgraded performance, transactions can be done faster and more securely than ever before.',
  },
});

function WalletEmptyBanner({ onBuySellClick, intl, goToReceivePage }: Props & Intl): Node {
  const actions = [
    {
      label: intl.formatMessage(globalMessages.buy),
      variant: 'contained',
      onClick: onBuySellClick,
    },
    {
      label: intl.formatMessage(globalMessages.receive),
      variant: 'outlined',
      onClick: goToReceivePage,
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.background.gradients.walletEmptyCard,
          marginBottom: '40px',
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '24px',
        }}
      >
        <Box sx={{ position: 'absolute', right: '10%', top: '-10%' }}>
          <CoverBg />
        </Box>
        <Box>
          <Typography variant="h3" color="common.black" fontWeight={500} mb="8px">
            {intl.formatMessage(messages.welcomeMessage)}
          </Typography>
          <Typography variant="body1" color="common.black" maxWidth="500px" mb="48px">
            {intl.formatMessage(messages.welcomeMessageSubtitle)}
          </Typography>
        </Box>
        <Stack direction="row" gap="16px">
          {actions.map(action => (
            <Button
              key={action.label}
              variant={action.variant}
              color="primary"
              sx={{
                width: '100px',
                '&.MuiButton-sizeMedium': {
                  height: '40px',
                },
              }}
              onClick={action.onClick}
            >
              <Typography
                variant="button2"
                fontWeight={500}
                sx={{
                  lineHeight: '19px',
                }}
              >
                {action.label}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default (injectIntl(observer(WalletEmptyBanner)): ComponentType<Props>);
