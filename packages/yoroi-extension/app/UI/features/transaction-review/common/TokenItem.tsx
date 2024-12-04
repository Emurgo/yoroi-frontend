import { Box, Typography } from '@mui/material';
import React from 'react';

export const TokenItem = ({ label }) => {
  return (
    <Box component="button" sx={{ backgroundColor: 'ds.primary_100', borderRadius: '8px', padding: '4px 12px' }}>
      <Typography color="ds.text_primary_medium">{label}</Typography>
    </Box>
  );
};
