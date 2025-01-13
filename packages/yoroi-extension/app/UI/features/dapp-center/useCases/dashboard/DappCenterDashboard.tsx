import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ampli } from '../../../../../../ampli/index';
// import { useStrings } from '../../common/hooks/useStrings';
import { useDappCenter } from '../../module/DappCenterContextProvider';
import WelcomeBanner from '../../common/components/WelcomeBanner';


const DappCenterDashboard = (): JSX.Element => {
  const theme = useTheme();
  //const strings = useStrings();
  const { showWelcomeBanner } = useDappCenter();

  useEffect(() => {
    ampli.connectorPageViewed();
  }, []);


  return (
    <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      Hello Dapp Page Dashboard
      {showWelcomeBanner && <WelcomeBanner />}
    </Stack>
  );
};

export default DappCenterDashboard;
