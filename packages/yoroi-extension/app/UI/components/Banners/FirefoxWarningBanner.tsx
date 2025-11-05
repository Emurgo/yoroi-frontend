import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from '../icons';
import { useStrings } from '../../common/hooks/useStrings';

const NotProdWarningRoot = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.ds.sys_yellow_100,
  gap: 9,
}));

const WarningIcon = styled('span')(() => ({
  display: 'inline-flex',
  marginRight: 0,
}));

export const FirefoxWarningBanner: React.FC = () => {
  const theme: any = useTheme();
  const strings = useStrings();

  return (
    <NotProdWarningRoot py={8}>
      <WarningIcon>
        <Icon.InfoCircle fill={theme.palette.ds.sys_orange_500} />
      </WarningIcon>

      <Typography variant="body1" color="text_gray_medium" lineHeight={0}>
        {strings.firefoxNoSupport}
      </Typography>
    </NotProdWarningRoot>
  );
};
