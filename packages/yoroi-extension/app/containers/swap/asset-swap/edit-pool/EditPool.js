// @flow
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from '../../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as ChevronDownIcon } from '../../../../assets/images/revamp/icons/chevron-down.inline.svg';
import { useSwap } from '@yoroi/swap';
import { capitalize } from 'lodash';
import SwapPoolIcon from '../../../../components/swap/SwapPoolIcon';
import SwapPoolFullInfo from './PoolFullInfo';
import { useSwapForm } from '../../context/swap-form';
import { maybe } from '../../../../coreUtils';
import { useSwapFeeDisplay } from '../../hooks';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';

type Props = {|
  +defaultTokenInfo: RemoteTokenInfo,
  +handleEditPool: void => void,
|}

export default function EditSwapPool({ handleEditPool, defaultTokenInfo }: Props): React$Node {
  const [showFullInfo, setShowFullInfo] = useState(false);
  const { orderData } = useSwap();

  const { selectedPoolCalculation: calculation, bestPoolCalculation, type } = orderData;
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();

  const { formattedTotal } = useSwapFeeDisplay(defaultTokenInfo);

  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  if (!isValidTickers) {
    return null;
  }

  if (calculation == null) {
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: '16px',
          }}
        >
          <Typography component="div" variant="subtitle2" color="darkred">
            No viable pool found!
          </Typography>
        </Box>
      </Box>
    );
  }

  const { pool } = calculation;

  const titleTotalFeesFormatted = `Total: ${formattedTotal}`;

  const isLimitOrder = type === 'limit';
  const bestPool = bestPoolCalculation?.pool || {};
  const isAutoPool = bestPool.poolId === pool.poolId;

  const handleShowFullInfo = () => setShowFullInfo(p => !p);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '16px',
        }}
      >
        <Box display="flex" gap="8px" alignItems="center">
          <Typography component="div" variant="body1" color="grayscale.500">
            DEX
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Box display="flex" gap="8px" alignItems="center">
            <SwapPoolIcon provider={pool.provider} />
            <Typography component="div" variant="body1" color="grayscale.max">
              {maybe(pool.provider, p => `${capitalize(p)} ${isAutoPool ? '(Auto)' : ''}`)
                ?? 'No pool found'}
            </Typography>
            {isLimitOrder && (
              <Box sx={{ cursor: 'pointer' }} onClick={isLimitOrder ? handleEditPool : undefined}>
                <EditIcon />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
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
            justifyContent: 'space-between',
          }}
          onClick={handleShowFullInfo}
        >
          {pool.provider && (
            <Typography component="div" variant="body1" color="grayscale.max">
              {titleTotalFeesFormatted}
            </Typography>
          )}
          <Box sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Box sx={{ transform: showFullInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDownIcon />
            </Box>
          </Box>
        </Box>
        {showFullInfo && <SwapPoolFullInfo defaultTokenInfo={defaultTokenInfo} />}
      </Box>
    </Box>
  );
}
