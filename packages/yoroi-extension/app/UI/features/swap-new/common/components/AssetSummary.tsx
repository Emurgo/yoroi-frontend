import { Stack, Typography } from '@mui/material';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { TokenInfoIcon } from '../../../portfolio/common/components/TokenInfoIcon';
import { fontWeight } from '../../../../../styles/themes/tokens/tokens';
import { getPriceImpactRisk } from '../helpers';
import { PriceImpactIcon } from '../../useCases/ReviewReview/PriceImpactBanner';
import { usePriceImpactRiskThemeWeb } from '../hooks/usePriceImpactRiskTheme';
import { ASSET_DIRECTION_OUT, AssetDirection } from '../constants';

type AssetSummaryProps = {
  tokenId: any;
  value: string | number;
  direction?: AssetDirection;
};

export const AssetSummary = ({ tokenId, value, direction }: AssetSummaryProps) => {
  const { tokenInfos, swapForm } = useSwapRevamp();
  const tokenInfo = tokenInfos.get(tokenId);
  const effective = swapForm?.estimate?.priceImpact ?? 0;
  const risk = getPriceImpactRisk(effective);
  const { text: textColor } = usePriceImpactRiskThemeWeb(risk);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={12}>
        <TokenInfoIcon info={{ id: tokenInfo?.id, policy: tokenInfo?.fingerprint, name: tokenInfo?.name }} size="lg" />
        <Stack direction="column" justifyContent="space-between">
          <Typography variant="body1" color="ds.text_gray_medium" fontWeight={fontWeight.semibold}>
            {tokenInfo?.name}
          </Typography>
          <Typography variant="body2" color="ds.text_gray_low">
            {tokenInfo?.name ?? tokenInfo?.fingerprint}
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={4} direction="row" alignItems="center">
        {direction === ASSET_DIRECTION_OUT && <PriceImpactIcon risk={risk} />}
        <Typography variant="body1" color={textColor}>
          {value} {tokenInfo?.name}
        </Typography>
      </Stack>
    </Stack>
  );
};
