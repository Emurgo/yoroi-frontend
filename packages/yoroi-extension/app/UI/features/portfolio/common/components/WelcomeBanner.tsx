import React from 'react';
import { Box, Stack, Typography, styled, useTheme } from '@mui/material';
import NavigationButton from './NavigationButton';
import { useNavigateTo } from '../hooks/useNavigateTo';
import { useStrings } from '../hooks/useStrings';
import bannerYoroiWalletPng from '../assets/illustrations/banner-yoroi-wallet.png';

const Container = styled(Box)(({ theme }: any) => ({
  borderRadius: `${theme.shape.borderRadius}px !important`,
  backgroundImage: theme.palette.ds.bg_gradient_2,
}));

const WelcomeBanner = () => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="column" spacing={theme.spacing(6)} sx={{ padding: theme.spacing(3) }}>
          <Stack direction="column" spacing={theme.spacing(1)} maxWidth={'450px'}>
            <Typography variant="h3" fontWeight="500" color="ds.gray_max">
              {strings.welcomeBannerTitle}
            </Typography>
            <Typography color="ds.gray_max">{strings.welcomeBannerDesc}</Typography>
          </Stack>

          <Stack direction="row" spacing={theme.spacing(2)}>
            <NavigationButton width="99px" variant="contained" onClick={() => navigateTo.swapPage()} label={strings.swap} />
            <NavigationButton width="99px" variant="secondary" onClick={() => navigateTo.sendPage()} label={strings.send} />
            <NavigationButton width="99px" variant="secondary" onClick={() => navigateTo.receivePage()} label={strings.receive} />
          </Stack>
        </Stack>

        <Box component="img" src={bannerYoroiWalletPng} sx={{ marginRight: theme.spacing(11.5) }}></Box>
      </Stack>
    </Container>
  );
};
export default WelcomeBanner;
