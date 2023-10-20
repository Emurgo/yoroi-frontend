import { useState } from 'react';
import { Box, Input, Typography } from '@mui/material';
import { ReactComponent as ChevronDownIcon } from '../../assets/images/revamp/icons/chevron-down.inline.svg';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as DefaultToken } from '../../assets/images/revamp/token-default.inline.svg';

export default function SwapPool({
  name = '',
  isAuto = false,
  image = null,
  assets,
  isLoading,
  onSelectPool,
}) {
  const [showFullInfo, setShowFullInfo] = useState(false);

  const handleShowFullInfo = () => setShowFullInfo(p => !p);

  const [asset1, asset2] = assets;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'grayscale.400',
        borderRadius: '8px',
        position: 'relative',
        bgcolor: 'common.white',
        p: '16px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '8px',
        }}
        onClick={handleShowFullInfo}
      >
        <Box>{image || <DefaultToken />}</Box>
        <Typography
          onClick={e => {
            e.stopPropagation();
            onSelectPool();
          }}
          variant="body1"
          fontWeight={500}
          color="primary.500"
        >
          {name ? `${name} ${isAuto ? '(Auto)' : ''}` : 'No pool found'}
        </Typography>
        <Box flexGrow="1" flexShrink="0" display="flex" alignItems="center" gap="4px">
          <Box>Total:</Box>
          <Box>
            {asset2.amount} {asset2.ticker}
          </Box>
          <Box>+</Box>
          <Box>
            {asset1.amount} {asset1.ticker}
          </Box>
        </Box>
        <Box sx={{ transform: showFullInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDownIcon />
        </Box>
      </Box>
      {showFullInfo && (
        <Box sx={{ display: 'flex', flexFlow: 'column', gap: '8px', mt: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
              Min ADA{' '}
              <Box component="span" color="grayscale.900">
                <InfoIcon />
              </Box>
            </Box>
            <Box>0 ADA</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
              Minimum assets received
              <Box component="span" color="grayscale.900">
                <InfoIcon />
              </Box>
            </Box>
            <Box>0 ADA</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
              Fees{' '}
              <Box component="span" color="grayscale.900">
                <InfoIcon />
              </Box>
            </Box>
            <Box>0 ADA</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
