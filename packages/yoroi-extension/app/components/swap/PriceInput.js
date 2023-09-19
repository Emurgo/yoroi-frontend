import { Box, Input, Typography } from '@mui/material';

export default function PriceInput({ label, price, assets = [], readonly, isLoading }) {
  const [asset1, asset2] = assets;

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
        justifyContent: 'start',
        position: 'relative',
        bgcolor: readonly ? 'gray.50' : 'common.white',
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
          '::placeholder': { color: '#6b7384' },
        }}
        component="input"
        type="text"
        variant="body1"
        color="#000"
        placeholder="0"
        bgcolor={readonly ? 'gray.50' : 'common.white'}
        readOnly={readonly}
        value={price}
      />
      <Box sx={{ justifySelf: 'end' }}>
        <Box height="100%" width="min-content" display="flex" alignItems="center">
          <Box>{asset1.ticker}</Box>
          <Box>/</Box>
          <Box>{asset2.ticker}</Box>
        </Box>
      </Box>
    </Box>
  );
}
