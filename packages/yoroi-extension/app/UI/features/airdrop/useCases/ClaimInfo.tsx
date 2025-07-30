import { Box, Typography, styled, Stack } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';
import CopyableText from '../../../components/CopyableText';
import globalMessages from '../../../../i18n/global-messages';

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
    defaultMessage: '!!!A Destination address is the registered location for the Redemption of your NIGHT allocations -- that is, for receiving your redeemed tokens as they thaw. It must be an unused Cardano address -- i.e., must have no transaction history.',
  }
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

interface Props {
  alloc: string,
  destAddrBech32: string,
}

export function ClaimInfo1(props: Props & { isTrezor: boolean }) {
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px'}}>
        <Typography variant="body2" color="ds.text_gray_low">
          {intl.formatMessage(messages.size)}
          <InfoTooltip content={intl.formatMessage(messages.allocationTooltip)} />
        </Typography>
        {/*  @ts-ignore */}
        <Typography variant="h1xl">
          {alloc} NIGHT
        </Typography>
      </Box>
      {!isTrezor && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px'}}>
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

export function ClaimInfo2(props: Props) {
  const intl = useIntl();
  const { alloc, destAddrBech32 } = props;

  return (
    <Stack spacing="24px">
      <Box  sx={{ border: '1px solid', borderColor: 'ds.gray_200', padding: '16px', borderRadius: '8px' }}>
        <Stack spacing="16px">
          <Typography variant="h5"  sx={{ svg: { verticalAlign: 'bottom', marginLeft: '8px' }}}>
            {intl.formatMessage(messages.size)}
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
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'ds.gray_200', padding: '16px', borderRadius: '8px' }}>
        <Stack spacing="16px">
          <Typography variant="h5" sx={{ svg: { verticalAlign: 'bottom', marginLeft: '8px' }}}>
            {intl.formatMessage(messages.destinationAddress)}
            <InfoTooltip content={intl.formatMessage(messages.destAddrTooltip)} />
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {intl.formatMessage(globalMessages.addressLabel)}
          </Typography>
          <CopyableText value={destAddrBech32} copyButtonFollowText>
            <Typography variant="body1" color="ds.text_gray_low" sx={{ wordBreak: 'break-all' }}>
              {destAddrBech32}
            </Typography>
          </CopyableText>
        </Stack>
      </Box>
    </Stack>
  );
}
