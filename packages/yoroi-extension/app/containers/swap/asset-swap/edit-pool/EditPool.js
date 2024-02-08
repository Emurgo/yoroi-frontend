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
import { Quantities } from '../../../../utils/quantities';
import { maybe } from '../../../../coreUtils';

type Props = {|
  +handleEditPool: void => void,
|}

export default function EditSwapPool({ handleEditPool }: Props): React$Node {
  const [showFullInfo, setShowFullInfo] = useState(false);
  const { orderData } = useSwap();

  const { selectedPoolCalculation: calculation, amounts, bestPoolCalculation, type } = orderData;
  console.log('🚀 ~ EditSwapPool ~ amounts:', amounts);

  const {
    buyQuantity: { isTouched: isBuyTouched },
    sellQuantity: { isTouched: isSellTouched },
    sellTokenInfo,
  } = useSwapForm();

  if (!isBuyTouched || !isSellTouched || calculation === undefined) return null;

  const { cost, pool } = calculation;

  const sellTokenIsPtToken = amounts.sell.tokenId === '';
  const sumQty = [cost.batcherFee.quantity, cost.frontendFeeInfo.fee.quantity];

  if (sellTokenIsPtToken) {
    sumQty.push(amounts.sell.quantity);
  }

  // TODO: do not hardcode pt ticker
  const totalFees = Quantities.format(Quantities.sum(sumQty), 6);
  const sellTokenTotal = sellTokenIsPtToken
    ? `${totalFees} ADA`
    : `${Quantities.format(amounts.sell.quantity, sellTokenInfo?.decimals ?? 0)} ${
        sellTokenInfo?.ticker ?? ''
      }`;

  const titleTotalFeesFormatted = `Total: ${
    !sellTokenIsPtToken ? `${sellTokenTotal} + ${totalFees} ADA` : sellTokenTotal
  }`;

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
        {showFullInfo && <SwapPoolFullInfo totalFees={totalFees} />}
      </Box>
    </Box>
  );
}
