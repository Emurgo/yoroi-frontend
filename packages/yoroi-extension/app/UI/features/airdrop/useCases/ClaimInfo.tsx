import { Box, Button, Typography, Stack, Divider, useTheme } from '@mui/material';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';
import CopyableText from '../../../components/CopyableText';
import { constructPlate } from '../../../../components/topbar/WalletCard';
import { useStrings } from '../common/hooks/useStrings';

interface Props2 {
  alloc: string;
  destAddrBech32: string;
  destAddrError: string;
  walletPlate: unknown;
  walletName: string;
}

export function ClaimInfo2(props: Readonly<Props2>) {
  const strings = useStrings();
  const theme: any = useTheme();
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
            {strings.phase1Allocation}
            <InfoTooltip content={strings.allocationTooltip} />
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
            {strings.walletLabel}
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
            {strings.destinationAddress}
            <InfoTooltip content={strings.destAddrTooltip} />
          </Typography>
          {destAddrError ? (
            <Typography variant="body1" color="red">
              {destAddrError}
            </Typography>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {strings.addressLabel}
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
          background: theme.palette.ds.bg_gradient_1,
          padding: '24px',
        }}
      >
        <Typography variant="h5">{strings.phase2Title}</Typography>
        <Typography>{strings.phase2Text}</Typography>
        <Button
          variant="outlined"
          style={{ border: '2px solid' }}
          onClick={() => window.open('https://www.midnight.gd/', '_blank', 'noopener,noreferrer')}
        >
          {strings.goToMidnightApp}
        </Button>
      </Box>
    </Stack>
  );
}
