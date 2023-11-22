//@flow
import { Box, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as AssetDefault } from '../../../assets/images/revamp/asset-default.inline.svg';
import { ReactComponent as MinswapImage } from '../mockAssets/minswap.inline.svg';
import { ReactComponent as AdaTokenImage } from '../mockAssets/ada.inline.svg';
import { ReactComponent as UsdaTokenImage } from '../mockAssets/usda.inline.svg';
import TextField from '../../../components/common/TextField';
import type { AssetAmount } from '../../../components/swap/types';

type Props = {|
  poolInfo: any,
|};

export default function SwapConfirmationStep({ poolInfo = {} }: Props): React$Node {
  return (
    <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="24px">
      <Box textAlign="center">
        <Typography variant="h4" fontWeight={500}>
          Confirm swap transaction
        </Typography>
      </Box>
      <Box display="flex" gap="16px" flexDirection="column">
        <Box>
          <Box>
            <Typography variant="body1" color="grayscale.500">
              Swap From
            </Typography>
          </Box>
          <Box>
            <AssetRow
              asset={{
                image: (<AdaTokenImage />),
                name: 'ADA',
                ticker: 'ADA',
                address: 'Cardano',
                amount: '9',
                walletAmount: 0,
              }}
            />
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography variant="body1" color="grayscale.500">
              Swap To
            </Typography>
          </Box>
          <Box>
            <AssetRow
              asset={{
                image: (<UsdaTokenImage />),
                name: '[USDA] Anzens',
                ticker: 'USDA',
                address: 'asse1maasdafsfs3245s2asddadsadfww6hv343',
                amount: '9',
                walletAmount: 0,
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" gap="8px" flexDirection="column">
        <SummaryRow
          col1="Dex"
          col2={
            <Box display="flex" alignItems="center" gap="8px">
              <Box display="inline-flex">{poolInfo.image}</Box>
              <Typography variant="body1" color="primary.500" fontWeight={500}>
                {poolInfo.name} {poolInfo.isAuto ? '(Auto)' : null}
              </Typography>
            </Box>
          }
        />
        <SummaryRow col1="Slippage tolerance" col2="1%" withInfo />
        <SummaryRow col1="Min ADA" col2="2 ADA" withInfo />
        <SummaryRow col1="Minimum assets received" col2="2.99 USDA" withInfo />
        <SummaryRow col1="Fees" col2="0 ADA" withInfo />
        <Box p="16px" bgcolor="#244ABF" borderRadius="8px" color="common.white">
          <Box display="flex" justifyContent="space-between">
            <Box>Total</Box>
            <Typography fontSize="20px" fontWeight="500">
              11 ADA
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box />
            <Typography variant="body1">4.32 USD</Typography>
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

const AssetRow = ({
  asset,
  usdAmount = null
}: AssetRowProps) => {
  const {
    image = null,
    name,
    address,
    amount,
    ticker,
  } = asset;
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
        {image || <AssetDefault />}
      </Box>
      <Box flexGrow="1" width="100%">
        <Box>
          <Typography variant="body1">{name}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="grayscale.600">
            {address}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
        <Typography variant="body1" color="grayscale.900">
          <span>{amount}</span>&nbsp;<span>{ticker}</span>
        </Typography>
        {usdAmount && (
          <Typography variant="body2" color="grayscale.600">
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
      <Typography variant="body1" color="grayscale.500">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px">
          <InfoIcon />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography variant="body1">{col2}</Typography>
    </Box>
  </Box>
);
