import { Box, Typography, styled, Stack, Divider } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';
import CopyableText from '../../../components/CopyableText';
import globalMessages from '../../../../i18n/global-messages';
import { constructPlate } from '../../../../components/topbar/WalletCard';

const messages = defineMessages({
  size: {
    id: 'airdrop.size',
    defaultMessage: '!!!Your allocation size',
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
  allocation: {
    id: 'airdrop.success.allocation',
    defaultMessage: '!!!Your successfully claimed allocation',
  },
  next1: {
    id: 'airdrop.next1',
    defaultMessage: '!!!What’s next?',
  },
  next2: {
    id: 'airdrop.next2',
    defaultMessage: '!!!After this claim phase ends, a second claim phase (Scavenger Mine) will start.',
  },
  next3: {
    id: 'airdrop.next3',
    defaultMessage:
      "!!!When that phase ends, the Redemption period will start, and you'll be able to redeem your claimed allocations as they thaw.",
  },
});

const BoxWithInfo = styled(Box)(({ theme }) => ({
  '& svg': {
    verticalAlign: 'bottom',
    marginLeft: '8px',
    '& path': {
      // @ts-ignore
      fill: theme.palette.ds.el_gray_low,
    },
  },
}));

interface Props1 {
  alloc: string;
  destAddrBech32: string;
  isTrezor: boolean;
}

export function ClaimInfo1(props: Readonly<Props1>) {
  const intl = useIntl();
  const { alloc, destAddrBech32, isTrezor } = props;

  return (
    <BoxWithInfo
      sx={{
        borderRadius: '8px',
        bgcolor: 'ds.bg_color_contrast_min',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography variant="body2" color="ds.text_gray_low">
          {intl.formatMessage(messages.size)}
          <InfoTooltip content={intl.formatMessage(messages.allocationTooltip)} />
        </Typography>
        {/*  @ts-ignore */}
        <Typography variant="h1xl">{alloc} NIGHT</Typography>
      </Box>
      {!isTrezor && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography variant="body2" color="ds.text_gray_low">
            {intl.formatMessage(messages.destinationAddress)}
            <InfoTooltip content={intl.formatMessage(messages.destAddrTooltip)} />
          </Typography>
          <CopyableText value={destAddrBech32} copyButtonFollowText>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {destAddrBech32}
            </Typography>
          </CopyableText>
        </Box>
      )}
    </BoxWithInfo>
  );
}

interface Props2 {
  alloc: string;
  destAddrBech32: string;
  walletPlate: unknown;
  walletName: string;
}

export function ClaimInfo2(props: Readonly<Props2>) {
  const intl = useIntl();
  const { alloc, destAddrBech32, walletPlate, walletName } = props;
  const [accountPlateId, iconComponent] = constructPlate(walletPlate, {
    saturationFactor: 0,
    size: 8,
    scalePx: 3,
    iconSize: 24,
    borderRadius: 4,
  });

  return (
    <Stack spacing="24px">
      <Box sx={{ border: '1px solid', borderColor: 'ds.gray_200', borderRadius: '8px' }}>
        <Stack spacing="16px" sx={{ padding: '16px' }}>
          <Typography variant="h5" sx={{ svg: { verticalAlign: 'bottom', marginLeft: '8px' } }}>
            {intl.formatMessage(messages.allocation)}
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
        </Stack>
      </Box>
      <Stack spacing="4px">
        <Typography variant="body1" color="ds.text_gray_low">
          {intl.formatMessage(messages.next1)}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(messages.next2)}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(messages.next3)}
        </Typography>
      </Stack>
    </Stack>
  );
}
