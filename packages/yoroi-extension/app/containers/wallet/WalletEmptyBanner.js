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
  goToSendPage(): void,
  goToReceivePage(): void,
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

function WalletEmptyBanner({
  onBuySellClick,
  intl,
  goToSendPage,
  goToReceivePage,
}: Props & Intl): Node {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
        minHeight: 198,
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
        <Button
          variant="contained"
          color="primary"
          sx={{ width: '100px' }}
          onClick={onBuySellClick}
        >
          <Typography variant="button2" fontWeight={500}>
            {intl.formatMessage(globalMessages.buy)}
          </Typography>
        </Button>
        <Button variant="outlined" color="primary" sx={{ width: '100px' }} onClick={goToSendPage}>
          <Typography variant="button2" fontWeight={500}>
            {intl.formatMessage(globalMessages.sendButtonLabel)}
          </Typography>
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ width: '100px' }}
          onClick={goToReceivePage}
        >
          <Typography variant="button2" fontWeight={500}>
            {intl.formatMessage(globalMessages.receive)}
          </Typography>
        </Button>
      </Stack>
    </Box>
  );
}

export default (injectIntl(observer(WalletEmptyBanner)): ComponentType<Props>);
