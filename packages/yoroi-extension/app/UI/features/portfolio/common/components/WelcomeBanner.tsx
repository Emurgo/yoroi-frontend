import { Box, Stack, Typography, styled } from '@mui/material';
import React from 'react';
import { WelcomeWallet } from '../../../../components/ilustrations/WelcomeWallet';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { useStrings } from '../hooks/useStrings';
import NavigationButton from './NavigationButton';

const Container = styled(Box)(({ theme }: any) => ({
  borderRadius: `${theme.shape.borderRadius}px !important`,
  backgroundImage: theme.palette.ds.bg_gradient_1,
  height: '194px',
  position: 'relative',
}));

const WelcomeBanner = () => {
  const strings = useStrings();
  const { openBuyDialog } = usePortfolio();

  return (
    <Container>
      <Stack direction="column" justifyContent="space-between">
        <Stack direction="column" sx={{ padding: '24px' }}>
          <Stack direction="column" maxWidth={'400px'} mb="20px">
            <Typography variant="h3" fontWeight="500" fontSize="18px" color="ds.gray_max" mb="8px">
              {strings.welcomeBannerTitle}
            </Typography>
            <Typography color="ds.gray_max" variant="body1">
              {strings.welcomeBannerDesc}
            </Typography>
          </Stack>

          <Stack direction="row">
            <NavigationButton width="105px" variant="primary" onClick={() => openBuyDialog()} label={strings.buyAda} />
          </Stack>
        </Stack>

        <Box sx={{ position: 'absolute', right: 2 }}>
          <WelcomeWallet />
        </Box>
      </Stack>
    </Container>
  );
};
export default WelcomeBanner;
