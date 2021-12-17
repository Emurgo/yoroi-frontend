// @flow
import { observer } from 'mobx-react';
import type { ComponentType, Node } from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';

type Props = {||}

const DappConnectorNavbar = (): Node => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="var(--yoroi-palette-common-white)"
      boxShadow="0 2px 5px 3px rgba(0, 0, 0, 0.06)"
    >
      <Typography color="var(--yoroi-palette-gray-800)" variant="h5" padding="32px 40px">
        Dapp connector
      </Typography>
    </Box>
  );
};
export default (observer(DappConnectorNavbar): ComponentType<Props>);
