import { Typography, Stack } from '@mui/material';
import { useSwapRevamp } from '../../../module/SwapContextProvider';

type DexRoute = {
  id: string;
  protocol: string;
  finalPrice: string;
  priceImpact: string;
  batcherFee: string;
  fee: string;
  expectedOutputWithoutSlippage: number;
};

type Props = {
  data: DexRoute[];
};

export const DexRouteTable = ({ data }: Props) => {
  const { swapForm } = useSwapRevamp();
  const total = data.reduce((acc, curr) => (acc += curr.expectedOutputWithoutSlippage), 0);

  return (
    <Stack width="100%" gap={16} direction="column">
      {data.map(row => {
        return (
          <Stack key={row.id} width="100%" flexDirection="row" justifyContent="space-between">
            <Stack>
              {/* <span>{row.logo}</span> */}
              <Typography variant="body2">{row.protocol}</Typography>
            </Stack>
            <Stack>
              <Typography variant="body2">{((100 * (row.expectedOutputWithoutSlippage ?? 0)) / total).toFixed(2)} %</Typography>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};
