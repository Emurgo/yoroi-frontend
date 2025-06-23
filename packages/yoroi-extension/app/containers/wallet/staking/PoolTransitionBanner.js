// @flow

import type { Node } from 'react';
import { styled } from '@mui/system';
import { Alert, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { useIntl } from 'react-intl';

export const PoolTransitionBanner = ({ showBanner }: {| showBanner?: boolean |}): Node => {
  const intl = useIntl();
  if (!showBanner) return null;
  return (
    <SAlert
      severity="error"
      sx={{
        '& .MuiAlert-icon': {
          color: 'magenta.500',
        },
        '& .MuiSvgIcon-root ': {
          width: '24px',
          height: '24px',
        },
      }}
    >
      <Typography variant="body2" mt="1px" ml="4px" color="grayscale.900">
        {intl.formatMessage(globalMessages.poolNotGenerating)}
      </Typography>
    </SAlert>
  );
};

const SAlert = styled(Alert)({
  width: '100%',
  justifyContent: 'center',
  backgroundColor: 'magenta.100',
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
  height: '40px',
  padding: 0,
  '& .MuiAlert-icon': {
    color: 'magenta.500',
    fontSize: '26px',
    margin: '0',
  },
});
