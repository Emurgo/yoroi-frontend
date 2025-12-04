import { Box, Typography, Button } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as Illustration } from './group-7.svg';

const messages = defineMessages({
  phase1Closed1: {
    id: 'aidrop.phase1Closed.line1',
    defaultMessage: '!!!Phase 1 of the Midnight claiming event has now closed.',
  },
  phase1Closed2: {
    id: 'aidrop.phase1Closed.line2',
    defaultMessage: '!!!But good news — Phase 2, called Scavenger Mine, is live!',
  },
  phase1Closed3: {
    id: 'aidrop.phase1Closed.line3',
    defaultMessage: '!!!Connect your wallet in the Midnight DApp to start earning NIGHT tokens.',
  },
  phase1Closed4: {
    id: 'aidrop.phase1Closed.line4',
    defaultMessage: '!!!Don’t miss your chance to take part in the new phase.',
  },
});

export default function Zero() {
  const intl = useIntl();

  return (
    <Box
      sx={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '612px',
        borderRadius: '8px',
        background: 'var(--light-theme-gradients-bg-gradient-1, linear-gradient(312deg, #C6F7ED 0%, #E4E8F7 70.58%))',
        padding: '24px',
        gap: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ margin: 'auto' }}>
        <Illustration />
      </Box>
      {/*  @ts-ignore */}
      <Typography variant="h5" sx={{ lineHeight: '26px' }}>
        {intl.formatMessage(messages.phase1Closed1)}
        <br />
        {intl.formatMessage(messages.phase1Closed2)}
      </Typography>

      {/*  @ts-ignore */}
      <Typography variant="body-1-regular" sx={{ lineHeight: '24px' }} as="div">
        {intl.formatMessage(messages.phase1Closed3)}
        <br />
        {intl.formatMessage(messages.phase1Closed4)}
      </Typography>

      <Button
        variant="outlined"
        style={{ border: '2px solid' }}
        onClick={() => window.open('https://www.midnight.gd/', '_blank', 'noopener,noreferrer')}
      >
        {intl.formatMessage(globalMessages.goToMidnightApp)}
      </Button>
    </Box>
  );
}
