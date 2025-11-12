import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useSwapRevamp } from '../../module/SwapContextProvider';
import { Icon } from '../../../../components';
import { useStrings } from '../../common/hooks/useStrings';
import { getPriceImpactRisk } from '../../common/helpers';
import { usePriceImpactRiskThemeWeb } from '../../common/hooks/usePriceImpactRiskTheme';

export const PriceImpactBanner = () => {
  const { swapForm } = useSwapRevamp();
  const strings = useStrings();
  const effective = swapForm?.estimate?.priceImpact ?? 0;
  const risk = getPriceImpactRisk(effective);
  console.log('risk', risk);
  const { text: textColor, background } = usePriceImpactRiskThemeWeb(risk);
  console.log('risk', { risk, textColor, background });

  if (swapForm.orderType === 'limit' || risk === 'none') return null;

  return (
    <Stack bgcolor={background} py={12} px={16} mb={32} borderRadius={2} spacing={8}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ minHeight: 24, marginBottom: '-8px' }}>
        {risk === 'moderate' && <Icon.InfoCircle fill={textColor} />}
        {risk === 'high' && <Icon.ErrorTriangle fill={textColor} />}

        <Typography variant="body1" sx={{ color: textColor }} ml={4} fontWeight={500}>
          {strings.priceImpact}
        </Typography>
      </Stack>
      <Typography>
        {risk === 'moderate' && strings.priceImpactModerate}
        {risk === 'high' && strings.priceImpactSevere}
      </Typography>
    </Stack>
  );
};

export const PriceImpactIcon = ({ risk }) => {
  const { text: textColor } = usePriceImpactRiskThemeWeb(risk);
  return (
    <>
      {risk === 'moderate' && <Icon.InfoCircle fill={textColor} />}
      {risk === 'high' && <Icon.ErrorTriangle fill={textColor} />}
    </>
  );
};
