//@flow
import type { AssetAmount } from '../../../components/swap/types';
import { Box, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import assetDefault from '../../../assets/images/revamp/asset-default.inline.svg';
import TextField from '../../../components/common/TextField';
import { useSwapForm } from '../context/swap-form';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';
import { useSwap } from '@yoroi/swap';
import SwapPoolIcon from '../../../components/swap/SwapPoolIcon';
import { capitalize } from 'lodash';

export default function SwapConfirmationStep(): React$Node {
  const { orderData } = useSwap();
  const { buyTokenInfo, sellTokenInfo } = useSwapForm();

  const { selectedPoolCalculation: calculation, amounts, bestPoolCalculation, type } = orderData;

  const { pool } = calculation;

  const bestPool = bestPoolCalculation?.pool || {};
  const isAutoPool = bestPool.poolId === pool.poolId;

  return (
    <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="24px">
      <Box textAlign="center">
        <Typography component="div" variant="h4" fontWeight={500}>
          Confirm swap transaction
        </Typography>
      </Box>
      <Box display="flex" gap="16px" flexDirection="column">
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="grayscale.500">
              Swap From
            </Typography>
          </Box>
          <Box>
            <AssetRow asset={sellTokenInfo} />
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="grayscale.500">
              Swap To
            </Typography>
          </Box>
          <Box>
            <AssetRow asset={buyTokenInfo} />
          </Box>
        </Box>
      </Box>
      <Box display="flex" gap="8px" flexDirection="column">
        <SummaryRow
          col1="Dex"
          col2={
            <Box display="flex" gap="8px" alignItems="center">
              <SwapPoolIcon provider={pool.provider} />
              <Typography component="div" variant="body1" fontWeight={500} color="primary.500">
                {`${capitalize(pool.provider)} ${isAutoPool ? '(Auto)' : ''}`}
              </Typography>
            </Box>
          }
        />
        <SummaryRow col1="Slippage tolerance" col2={`${orderData.slippage}%`} withInfo />
        <SwapPoolFullInfo />
        <Box p="16px" bgcolor="#244ABF" borderRadius="8px" color="common.white">
          <Box display="flex" justifyContent="space-between">
            <Box>Total</Box>
            <Typography component="div" fontSize="20px" fontWeight="500">
              WIP
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box />
            <Typography component="div" variant="body1">
              WIP
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box>
        <TextField
          className="walletPassword"
          value=""
          label="Password"
          type="password"
          // {...walletPasswordField.bind()}
          // done={walletPasswordField.isValid}
          // error={walletPasswordField.error}
        />
      </Box>
    </Box>
  );
}

type AssetRowProps = {|
  asset: AssetAmount,
  usdAmount?: string,
|};

const AssetRow = ({ asset, usdAmount = null }: AssetRowProps) => {
  const { image = null, name, address, amount, ticker } = asset;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        p: '8px',
      }}
    >
      <Box flexShrink="0" width="48px" height="48px">
        <img
          src={image}
          alt=""
          width="100%"
          onError={img => {
            img.src = assetDefault;
          }}
        />
      </Box>
      <Box flexGrow="1" width="100%">
        <Box>
          <Typography component="div" variant="body1">
            {name}
          </Typography>
        </Box>
        <Box>
          <Typography component="div" variant="body2" color="grayscale.600">
            {address}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
        <Typography component="div" variant="body1" color="grayscale.900">
          <span>{amount}</span>&nbsp;<span>{ticker}</span>
        </Typography>
        {usdAmount && (
          <Typography component="div" variant="body2" color="grayscale.600">
            {usdAmount} USD
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const SummaryRow = ({ col1, col2, withInfo = false }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography component="div" variant="body1" color="grayscale.500">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px">
          <InfoIcon />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography component="div" variant="body1">
        {col2}
      </Typography>
    </Box>
  </Box>
);
