import { useEffect } from 'react';
import { Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ampli } from '../../../../../../ampli/index';
// import { useStrings } from '../../common/hooks/useStrings';

const DappCenterDashboard = (): JSX.Element => {
  const theme = useTheme();
  //const strings = useStrings();

  useEffect(() => {
    ampli.connectorPageViewed();
  }, []);


  return (
    <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      Hello Dapp Page Dashboard
    </Stack>
  );
};

export default DappCenterDashboard;
