//@flow
// import type { AssetAmount } from '../../../components/swap/types';
import { Box, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import TextField from '../../../components/common/TextField';
import { useSwapForm } from '../context/swap-form';
import { AssetAndAmountRow } from '../../../components/swap/SelectAssetDialog';
import { useSwap } from '@yoroi/swap';
import SwapPoolIcon from '../../../components/swap/SwapPoolIcon';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';

type Props = {|
  slippageValue: string,
  defaultTokenInfo: RemoteTokenInfo,
|};

export default function SwapConfirmationStep({ slippageValue, defaultTokenInfo }: Props): React$Node {

  const {
    orderData: {
      selectedPoolCalculation: { pool },
      bestPoolCalculation: { pool: bestPool },
    },
  } = useSwap();
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();

  const isAutoPool = pool?.poolId === bestPool?.poolId;

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
            <AssetAndAmountRow
              asset={sellTokenInfo}
              displayAmount={sellQuantity.displayValue}
              type="from"
              defaultTokenInfo={defaultTokenInfo}
            />
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="grayscale.500">
              Swap To
            </Typography>
          </Box>
          <Box>
            <Box>
              <AssetAndAmountRow
                asset={buyTokenInfo}
                displayAmount={buyQuantity.displayValue}
                type="from"
                defaultTokenInfo={defaultTokenInfo}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" gap="8px" flexDirection="column">
        <SummaryRow
          col1="Dex"
          col2={
            <Box display="flex" alignItems="center" gap="8px">
              <Box display="inline-flex">
                <SwapPoolIcon provider={pool?.provider} />
              </Box>
              <Typography component="div" variant="body1" color="primary.500" fontWeight={500}>
                {pool?.provider} {isAutoPool ? '(Auto)' : null}
              </Typography>
            </Box>
          }
        />
        <SummaryRow col1="Slippage tolerance" col2={`${slippageValue}%`} withInfo />
        <SwapPoolFullInfo defaultTokenInfo={defaultTokenInfo} />
        <Box p="16px" bgcolor="#244ABF" borderRadius="8px" color="common.white">
          <Box display="flex" justifyContent="space-between">
            <Box>Total</Box>
            <Typography component="div" fontSize="20px" fontWeight="500">
              11 ADA
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box />
            <Typography component="div" variant="body1">
              4.32 USD
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

// type AssetRowProps = {|
//   asset: AssetAmount,
//   usdAmount?: string,
// |};

// const AssetRow = ({ asset, usdAmount = null }: AssetRowProps) => {
//   const { image = null, name, address, amount, ticker } = asset;
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: '12px',
//         p: '8px',
//       }}
//     >
//       <Box flexShrink="0" width="48px" height="48px">
//         {image || <AssetDefault />}
//       </Box>
//       <Box flexGrow="1" width="100%">
//         <Box>
//           <Typography component="div" variant="body1">
//             {name}
//           </Typography>
//         </Box>
//         <Box>
//           <Typography component="div" variant="body2" color="grayscale.600">
//             {address}
//           </Typography>
//         </Box>
//       </Box>
//       <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
//         <Typography component="div" variant="body1" color="grayscale.900">
//           <span>{amount}</span>&nbsp;<span>{ticker}</span>
//         </Typography>
//         {usdAmount && (
//           <Typography component="div" variant="body2" color="grayscale.600">
//             {usdAmount} USD
//           </Typography>
//         )}
//       </Box>
//     </Box>
//   );
// };

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
