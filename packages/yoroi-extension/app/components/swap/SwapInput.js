import { Box, Input, Typography } from '@mui/material';

export default function SwapInput({ label, asset = {}, isLoading }) {
  const { amount, ticker } = asset;

  return (
    <Box
      component="fieldset"
      sx={{
        border: '1px solid',
        borderColor: 'gray.400',
        borderRadius: '8px',
        p: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateRows: '1fr 1fr',
        justifyContent: 'start',
        position: 'relative',
        bgcolor: 'common.white',
        columnGap: '6px',
        rowGap: '8px',
      }}
    >
      <Box
        component="legend"
        sx={{
          top: '-9px',
          left: '16px',
          position: 'absolute',
          px: '4px',
          bgcolor: 'common.white',
        }}
      >
        {label}
      </Box>

      <Typography
        sx={{
          appearance: 'none',
          border: '0',
          outline: 'none',
        }}
        component="input"
        type="text"
        variant="body1"
        color="#6B7384"
        placeholder="0"
      />
      <Box sx={{ justifySelf: 'end' }}>
        <Box height="100%" width="min-content" display="flex" gap="8px" alignItems="center">
          <Box>img</Box>
          <Box>ADA</Box>
          <Box>v</Box>
        </Box>
      </Box>
      <Box>
        <Typography
          component="button"
          variant="caption"
          fontWeight={500}
          sx={{ p: '4px 8px', bgcolor: '#F0F3F5', borderRadius: '8px' }}
        >
          MAX
        </Typography>
      </Box>
      <Box sx={{ alignSelf: 'end' }}>
        <Typography variant="caption" color="#6B7384">
          Current balance: 2.99932 TADA
        </Typography>
      </Box>
    </Box>
  );
}
