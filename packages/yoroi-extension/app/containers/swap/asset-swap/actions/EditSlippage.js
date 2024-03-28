// @flow
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as EditIcon } from '../../../../assets/images/revamp/icons/edit.inline.svg';

type EditSlippageProps = {|
  setOpenedDialog: (dialog: string) => void,
  slippageValue: string,
|};

export const EditSlippage = ({ setOpenedDialog, slippageValue }: EditSlippageProps): React$Node => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box display="flex" gap="8px" alignItems="center">
        <Typography component="div" variant="body1" color="grayscale.500">
          Slippage tolerance
        </Typography>
        <InfoIcon />
      </Box>
      <Box
        onClick={setOpenedDialog}
        sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
      >
        <Typography component="div" variant="body1" color="grayscale.max">
          {slippageValue}%
        </Typography>
        <EditIcon />
      </Box>
    </Box>
  );
};
