import { Box, Button, Typography, Stack, Divider } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';
import CopyableText from '../../../components/CopyableText';
import globalMessages from '../../../../i18n/global-messages';
import { constructPlate } from '../../../../components/topbar/WalletCard';

const messages = defineMessages({
  phase1Allocation: {
    id: 'airdrop.phase1Allocation',
    defaultMessage: '!!!Phase 1: Your successfully claimed allocation',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Your destination address',
  },
  allocationTooltip: {
    id: 'airdrop.tooltip.allocation',
    defaultMessage: '!!!This is the NIGHT token allocation entitlement for this claim based on the current wallet.',
  },
  destAddrTooltip: {
    id: 'airdrop.tooltop.destinationAddress',
    defaultMessage:
      '!!!A Destination address is the registered location for the Redemption of your NIGHT allocations -- that is, for receiving your redeemed tokens as they thaw. It must be an unused Cardano address -- i.e., must have no transaction history.',
  },
  phase2Title: {
    id: 'airdrop.phase2Title',
    defaultMessage: '!!!🧩  Phase 2 of midnight airdrop has started',
  },
  phase2Text: {
    id: 'airdrop.phase2Text',
    defaultMessage:
      '!!!The 2nd phase of midnight claiming called “Scavenger mine” has now started. Navigate to the midnight portal and connect your yoroi wallet to start earning NIGHT',
  },
});

interface Props2 {
  alloc: string;
  destAddrBech32: string;
  destAddrError: string;
  walletPlate: unknown;
  walletName: string;
}

export function ClaimInfo2(props: Readonly<Props2>) {
  const intl = useIntl();
  const { alloc, destAddrBech32, destAddrError, walletPlate, walletName } = props;
  const [accountPlateId, iconComponent] = constructPlate(walletPlate, {
    saturationFactor: 0,
    size: 8,
    scalePx: 3,
    iconSize: 24,
    borderRadius: 4,
  });

  return (
    <Stack spacing="24px" sx={{ width: '565px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Box sx={{ border: '1px solid', borderColor: 'ds.gray_200', borderRadius: '8px' }}>
        <Stack spacing="16px" sx={{ padding: '16px' }}>
          <Typography variant="h5" sx={{ svg: { verticalAlign: 'bottom', marginLeft: '8px' } }}>
            {intl.formatMessage(messages.phase1Allocation)}
            <InfoTooltip content={intl.formatMessage(messages.allocationTooltip)} />
          </Typography>
          <Box>
            <Typography variant="h2" component="span">
              {alloc}
            </Typography>
            &nbsp;
            <Typography variant="body2" sx={{ fontWeight: 500 }} component="span">
              NIGHT
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ padding: '16px', display: 'flex', flexDirection: 'row' }}>
          <Typography variant="body1" color="ds.text_gray_low">
            {intl.formatMessage(globalMessages.walletLabel)}
          </Typography>
          <div style={{ width: '18px' }} />
          {iconComponent}
          <div style={{ width: '8px' }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }} color="ds.text_gray_low">
            {walletName} | {accountPlateId}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'ds.gray_200', padding: '16px', borderRadius: '8px' }}>
        <Stack spacing="16px">
          <Typography variant="h5" sx={{ svg: { verticalAlign: 'bottom', marginLeft: '8px' } }}>
            {intl.formatMessage(messages.destinationAddress)}
            <InfoTooltip content={intl.formatMessage(messages.destAddrTooltip)} />
          </Typography>
          {destAddrError ? (
            <Typography variant="body1" color="red">
              {destAddrError}
            </Typography>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {intl.formatMessage(globalMessages.addressLabel)}
              </Typography>
              <CopyableText value={destAddrBech32} copyButtonFollowText>
                <Typography variant="body1" color="ds.text_gray_low" sx={{ wordBreak: 'break-all' }}>
                  {destAddrBech32}
                </Typography>
              </CopyableText>
            </Box>
          )}
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRadius: '8px',
          background: 'var(--light-theme-gradients-bg-gradient-1, linear-gradient(312deg, #C6F7ED 0%, #E4E8F7 70.58%))',
          padding: '24px',
        }}
      >
        <Typography>{intl.formatMessage(messages.phase2Title)}</Typography>
        <Typography>{intl.formatMessage(messages.phase2Text)}</Typography>
        <Button variant="outlined" style={{ border: '2px solid' }} onClick={() => window.open('https://www.midnight.gd/')}>
          {intl.formatMessage(globalMessages.goToMidnightApp)}
        </Button>
      </Box>
    </Stack>
  );
}
