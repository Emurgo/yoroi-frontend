// @flow
import { Box, Typography, styled } from '@mui/material';
import { useSwap } from '@yoroi/swap';
import { capitalize } from 'lodash';
import { useState } from 'react';
import { ReactComponent as ChevronDownIcon } from '../../../../assets/images/revamp/icons/chevron-down.inline.svg';
import { ReactComponent as EditIcon } from '../../../../assets/images/revamp/icons/edit.inline.svg';
import { SwapPoolIcon } from '../../../../components/swap/SwapPoolComponents';
import { maybe } from '../../../../coreUtils';
import { useSwapForm } from '../../context/swap-form';
import { useSwapFeeDisplay } from '../../hooks';
import SwapPoolFullInfo from './PoolFullInfo';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));

type Props = {|
  +defaultTokenInfo: RemoteTokenInfo,
  +handleEditPool: void => void,
|};

export default function EditSwapPool({ handleEditPool, defaultTokenInfo }: Props): React$Node {
  const [showFullInfo, setShowFullInfo] = useState(true);
  const { orderData } = useSwap();

  const { selectedPoolCalculation: calculation, bestPoolCalculation, type } = orderData;
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();

  const { formattedPtAmount, formattedNonPtAmount } = useSwapFeeDisplay(defaultTokenInfo);
  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;

  if (!isValidTickers || calculation == null) {
    return null;
  }

  const { pool } = calculation;

  const formattedTotal = formattedNonPtAmount == null ? formattedPtAmount : `${formattedNonPtAmount} + ${formattedPtAmount}`;
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
          <Typography component="div" variant="body1" color="ds.text_gray_normal">
            DEX
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Box display="flex" gap="8px" alignItems="center">
            <SwapPoolIcon provider={pool.provider} />
            <Typography component="div" variant="body1" color="ds.text_gray_normal">
              {maybe(pool.provider, p => `${capitalize(p)} ${isAutoPool ? '(Auto)' : ''}`) ?? 'No pool found'}
            </Typography>
            {isLimitOrder && (
              <IconWrapper sx={{ cursor: 'pointer' }} onClick={isLimitOrder ? handleEditPool : undefined}>
                <EditIcon />
              </IconWrapper>
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
          bgcolor: 'ds.bg_color_low',
          p: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showFullInfo && '8px',
            cursor: 'pointer',
          }}
          onClick={handleShowFullInfo}
        >
          {pool.provider && (
            <Typography component="div" variant="body1" color="ds.text_gray_normal">
              {titleTotalFeesFormatted}
            </Typography>
          )}
          <Box
            sx={{
              cursor: 'pointer',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}
          >
            <Box sx={{ transform: showFullInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDownIcon />
            </Box>
          </Box>
        </Box>
        {showFullInfo && <SwapPoolFullInfo defaultTokenInfo={defaultTokenInfo} withInfo showMinAda />}
      </Box>
    </Box>
  );
}
