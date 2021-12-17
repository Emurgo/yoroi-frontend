// @flow
import { observer } from 'mobx-react';
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { FormControlLabel, Switch, Typography } from '@mui/material';

type Props = {| +isSwitchOn: boolean |};

// TODO: verify is dapp connector is ON - isSwitchOn
const DappConnectorNavbarRevamp = ({ isSwitchOn }: Props): Node => {
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
      <FormControlLabel
        sx={{ paddingRight: '40px' }}
        labelPlacement="start"
        control={<CustomSwitch checked={isSwitchOn} sx={{ ml: '12px' }} />}
        label={
          <Typography variant="body2" color="var(--yoroi-palette-gray-600)">
            Dapp Connector is {isSwitchOn ? 'on' : 'off'}
          </Typography>
        }
      />
    </Box>
  );
};
export default (observer(DappConnectorNavbarRevamp): ComponentType<Props>);

const CustomSwitch = styled(props => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 32,
  height: 20,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    marginTop: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: 'var(--yoroi-palette-common-white)',
      '& + .MuiSwitch-track': {
        backgroundColor: 'var(--yoroi-palette-secondary-300)',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: 'var(--yoroi-palette-secondary-300)',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: 'var(--yoroi-palette-gray-200)',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 15,
    height: 15,
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    backgroundColor: 'var(--yoroi-palette-gray-100)',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));
