import React from 'react';
import { Box } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import { ReactComponent as CoverBg } from './wallet-empty-banner.inline.svg';
import { captureEvent } from '../../../../../../posthog';
import { TESTNET_FAUCET } from '../constants';
import { useStrings } from '../hooks/useStrings';

export type WalletEmptyBannerProps = {
  onBuySellClick: () => void;
  isTestnet: boolean;
};

const WalletEmptyBanner: React.FC<WalletEmptyBannerProps> = ({ isTestnet, onBuySellClick }) => {
  const strings = useStrings();

  const handleClick = () => {
    if (isTestnet) {
      window.open(TESTNET_FAUCET, '_blank');
    } else {
      onBuySellClick();
    }

    captureEvent('Wallet Page Exchange Clicked');
  };

  return (
    <Box>
      <Box
        sx={{
          background: theme => theme.palette.ds.bg_gradient_1,
          marginBottom: '40px',
          borderRadius: '8px',
          overflowY: 'hidden',
          position: 'relative',
          padding: '16px',
          height: 'auto',
        }}
        id="wallet|staking-emptyWalletBanner-box"
      >
        <Box sx={{ position: 'absolute', right: '1%', top: 'auto', bottom: '-3px' }}>
          <CoverBg />
        </Box>

        <Box>
          <Typography component="div" variant="h3" color="ds.gray_max" fontWeight={500} fontSize="18px" mb="8px">
            {isTestnet ? strings.welcomeMessageTestnet : strings.welcomeMessage}
          </Typography>

          <Typography component="div" variant="body1" color="ds.gray_max" mb="24px">
            {isTestnet ? strings.welcomeMessageSubtitleTestnet : strings.welcomeMessageSubtitle}
            {isTestnet ? (
              <>
                <br />
                {strings.welcomeMessageSubtitleTestnetExtra}
              </>
            ) : null}
          </Typography>
        </Box>

        <Stack direction="row" gap="16px">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              '&.MuiButton-sizeMedium': {
                padding: '9px 20px',
                height: 'unset',
              },
            }}
            onClick={handleClick}
          >
            <Typography component="div" variant="button" fontWeight={500} sx={{ lineHeight: '19px' }}>
              {isTestnet ? strings.goToFaucetButton : strings.buyAda}
            </Typography>
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default WalletEmptyBanner;
