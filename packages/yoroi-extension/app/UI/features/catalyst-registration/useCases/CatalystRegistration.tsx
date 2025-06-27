import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useStrings } from '../common/hooks/useStrings';
import { IllustrationCard } from '../../../components/cards';
import {
  AppStoreBadge,
  CatalystLedger,
  CatalystTrezor,
  DownloadApp,
  OpenApp,
  PlayStoreBadge,
} from '../../../components/ilustrations';
import { handleExternalLinkClick } from '../../../../utils/routing';
import RegistrationDisclaimer from '../common/components/RegistrationDisclaimer';
import { useVoting } from '../common/hooks/useVoting';
import { CatalystRegistrationProcess } from './CatalystRegistrationProcess';

const CatalystRegistration = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const strings = useStrings();
  const { walletType } = useVoting();
  const isHardwareWallet = walletType === 'trezor' || walletType === 'ledger';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: isHardwareWallet ? '920px' : '612px',
        margin: '0 auto',
      }}
    >
      <Box textAlign="center">
        <Typography component="div" variant="h3" fontWeight={500}>
          {strings.title('Catalyst')}
        </Typography>
        <Typography component="div" variant="body1" color="grayscale.800" mt="16px" mb="8px">
          {strings.subtitle}
        </Typography>
      </Box>
      {showDisclaimer && <RegistrationDisclaimer onClose={() => setShowDisclaimer(false)} />}
      <Stack direction="row" width="100%" gap="24px" mt="8px">
        <IllustrationCard
          illustration={<DownloadApp />}
          title="Step 1"
          content={
            <>
              <Typography component="div" textAlign="center" variant="body2" color="grayscale.900" mb="16px">
                {strings.downloadApp}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap="8px">
                <Box
                  component="a"
                  href="https://apps.apple.com/kg/app/catalyst-voting/id1517473397"
                  onClick={handleExternalLinkClick}
                >
                  <AppStoreBadge />
                </Box>
                <Box
                  component="a"
                  href="https://play.google.com/store/apps/details?id=io.iohk.vitvoting"
                  onClick={handleExternalLinkClick}
                >
                  <PlayStoreBadge />
                </Box>
              </Stack>
            </>
          }
        />
        <IllustrationCard illustration={<OpenApp />} title="Step 2" content={strings.openApp} />
        {isHardwareWallet && (
          <IllustrationCard
            illustration={walletType === 'ledger' ? <CatalystLedger /> : <CatalystTrezor />}
            title="Step 3"
            content={walletType === 'ledger' ? strings.ledgerNanoRequirement : strings.trezorTRequirement}
          />
        )}
      </Stack>
      <CatalystRegistrationProcess />
    </Box>
  );
};

export default CatalystRegistration;
