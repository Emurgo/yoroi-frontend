import { Box, CircularProgress } from '@mui/material';

const Centered = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', py: '48px' }}>
    <CircularProgress />
  </Box>
);

export const StatusSkeletonScreen = Centered;
export const OptionsSkeletonScreen = Centered;
