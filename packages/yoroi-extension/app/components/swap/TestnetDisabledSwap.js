// @flow
import type { Node } from 'react';
import { injectIntl, defineMessages, type $npm$ReactIntl$IntlShape } from 'react-intl';
import { ReactComponent as Illustration }  from '../../assets/images/swap-testnet.svg';
import { Box, Typography, Button } from '@mui/material';

const messages = defineMessages({
  title: {
    id: 'swap.testnet.title',
    defaultMessage: '!!!Swap is only available on the mainnet',
  },
  message: {
    id: 'swap.testnet.message',
    defaultMessage: '!!!Switch networks to be able to use Swap in Yoroi',
  },
  switchNetwork: {
    id: 'swap.testnet.switch',
    defaultMessage: '!!!SWITCH NETWORK',
  },
});

type Props = {|
  onSwitch: () => void,              
|};

function TestnetDisabledSwap({
  onSwitch, intl
}: {|
  ...Props,
  intl: $npm$ReactIntl$IntlShape
|}): Node {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        top: '100px',
      }}
    >
      <Box sx={{ width: 'fit-content', margin: 'auto' }}>
        <Illustration />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '26px'
          }}
          color="ds.text_gray_medium"
        >
          {intl.formatMessage(messages.title)}
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
          }}
          color="ds.text_gray_low"
        >
          {intl.formatMessage(messages.message)}
        </Typography>
      </Box>
      <Box sx={{ width: 'fit-content', margin: 'auto' }}>
        <Button onClick={onSwitch}>
          {intl.formatMessage(messages.switchNetwork)}
        </Button>
      </Box>
    </Box>
  );
}

export default (injectIntl(TestnetDisabledSwap): React$ComponentType<Props>);
