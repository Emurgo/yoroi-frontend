//@flow
import { Box, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import TextField from '../../../components/common/TextField';
import { useSwapForm } from '../context/swap-form';
import { AssetAndAmountRow } from '../../../components/swap/SelectAssetDialog';
import { useSwap } from '@yoroi/swap';
import SwapPoolIcon from '../../../components/swap/SwapPoolIcon';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';
import { useSwapFeeDisplay } from '../hooks';
import type { PriceImpact } from '../../../components/swap/types';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import PriceImpactIcon from '../../../components/swap/PriceImpactIcon';

type Props = {|
  slippageValue: string,
  priceImpactState: ?PriceImpact,
  defaultTokenInfo: RemoteTokenInfo,
  getFormattedPairingValue: (amount: string) => string,
|};

export default function SwapConfirmationStep({
  slippageValue,
  priceImpactState,
  defaultTokenInfo,
  getFormattedPairingValue,
}: Props): React$Node {

  const {
    orderData: {
      selectedPoolCalculation: { pool },
      bestPoolCalculation: { pool: bestPool },
    },
  } = useSwap();
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();
  const { ptAmount, formattedPtAmount, formattedNonPtAmount } = useSwapFeeDisplay(defaultTokenInfo);

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
      {priceImpactState && (
        <Box
          component="div"
          bgcolor={priceImpactState.isSevere ? 'magenta.100' : 'yellow.100'}
          p='12px 17px 16px 16px'
          borderRadius='8px'
        >
          <Box sx={{ display: 'flex', marginBottom: '8px' }}>
            <PriceImpactIcon isSevere={priceImpactState.isSevere} />
            <Typography
              component="div"
              fontWeight="500"
              color={priceImpactState.isSevere ? 'magenta.500' : '#ED8600'}
            >
              Price impact
            </Typography>
          </Box>
          {priceImpactState.isSevere ? (
            <Typography component="div" variant="body1" color="grayscale.900">
              <Typography component="span" fontWeight="500">
                Price impact over 10%&nbsp;
              </Typography>
              may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.
            </Typography>
          ) : (
            <Typography component="div" variant="body1" color="grayscale.900">
              <Typography component="span" fontWeight="500">
                Price impact over 1%&nbsp;
              </Typography>
              may cause a difference in the amount you actually receive. Consider this at your own risk.
            </Typography>
          )}
        </Box>
      )}
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
            <Box>
              <Typography component="div" fontSize="20px" fontWeight="500">
                {formattedNonPtAmount ?? formattedPtAmount}
              </Typography>
            </Box>
          </Box>
          {formattedNonPtAmount && (
            <Box display="flex" justifyContent="right">
              <Box>
                <Typography component="div" fontSize="20px" fontWeight="500">
                  {formattedPtAmount}
                </Typography>
              </Box>
            </Box>
          )}
          <Box display="flex" justifyContent="right">
            <Typography component="div" variant="body1">
              {getFormattedPairingValue(ptAmount)}
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
