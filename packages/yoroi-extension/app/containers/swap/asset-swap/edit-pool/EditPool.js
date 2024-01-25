import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from '../../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as ChevronDownIcon } from '../../../../assets/images/revamp/icons/chevron-down.inline.svg';
import { useSwap } from '@yoroi/swap';
import { capitalize } from 'lodash';
import SwapPoolIcon from '../../../../components/swap/SwapPoolIcon';
import SwapPoolFullInfo from './PoolFullInfo';

export default function EditSwapPool({ handleEditPool }) {
  const [showFullInfo, setShowFullInfo] = useState(false);
  const { orderData } = useSwap();

  console.log('🚀 ~ EditSwapPool ~ orderData:', orderData);

  const isLimitOrder = orderData.type === 'limit';
  const bestPool = orderData.bestPoolCalculation?.pool || {};
  const pool = orderData.selectedPoolCalculation?.pool || {};
  const isAutoPool = bestPool.poolId === pool.poolId;

  const handleShowFullInfo = () => setShowFullInfo(p => !p);

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
      onClick={handleShowFullInfo}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" gap="8px" alignItems="center">
          <SwapPoolIcon provider={pool.provider} />
          <Typography component="div" variant="body1" fontWeight={500} color="primary.500">
            {pool.provider
              ? `${capitalize(pool.provider)} ${isAutoPool ? '(Auto)' : ''}`
              : 'No pool found'}
          </Typography>
          {pool.provider && (
            <Typography component="div" variant="body1" color="grayscale.max">
              Total: 0
            </Typography>
          )}
        </Box>
        <Box
          onClick={isLimitOrder ? handleEditPool : undefined}
          sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
        >
          {isLimitOrder && <EditIcon />}
          <Box sx={{ transform: showFullInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDownIcon />
          </Box>
        </Box>
      </Box>

      {showFullInfo && <SwapPoolFullInfo />}
    </Box>
  );
}
