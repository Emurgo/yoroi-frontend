import { Link, Stack, Typography, useTheme } from '@mui/material';
import { DisplayInfoInRow } from '../../common/components/DisplayInfoInRow';
import { useStrings } from '../../common/hooks/useStrings';

export const DexTradeInfo = () => {
  const strings = useStrings();
  const { atoms }: any = useTheme();

  return (
    <Stack direction="column" {...atoms.gap_md} width="100%" {...atoms.mt_lg}>
      <DisplayInfoInRow
        label={strings.routeLabel}
        tooltip={strings.routePath}
        value={
          <Typography>
            <Link>Museliswap</Link>
          </Typography>
        }
      />
      <DisplayInfoInRow label={strings.priceLabel} tooltip="Asset Price" value="223 ADA" />
      <DisplayInfoInRow
        label="Fees"
        tooltip={
          <>
            <Typography variant="body2" color="ds.gray_min">
              {strings.feesIncluded}
            </Typography>
            <Typography variant="body2" color="ds.gray_min">
              {strings.dexFee}
            </Typography>
            <Typography variant="body2" color="ds.gray_min">
              {strings.frontendFee}
            </Typography>
          </>
        }
        value="223 ADA"
      />
      <DisplayInfoInRow label={strings.minReceived} tooltip={strings.guaranteedMin} value="192.5 MILK" />
      <DisplayInfoInRow label={strings.slippageLabel} tooltip={strings.slippageInfo} value="0.5%" />
    </Stack>
  );
};
