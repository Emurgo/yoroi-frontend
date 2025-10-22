import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useSwapRevamp } from '../../module/SwapContextProvider';
import { usePriceImpactRiskThemeWeb } from '../hooks/usePriceImpactRiskTheme';
import { Icon } from '../../../../components';
import { getPriceImpactRisk } from '../helpers';
import { useStrings } from '../hooks/useStrings';

const PriceImpact = () => {
  const { swapForm } = useSwapRevamp();
  const strings= useStrings()
  const effective = swapForm?.estimate?.priceImpact ?? 0;
  const risk = getPriceImpactRisk(effective);
  const { text: textColor } = usePriceImpactRiskThemeWeb(risk);

  if (swapForm.orderType === 'limit' || risk === 'none') return null;

  const formatted = `${Math.ceil(effective * 100) / 100}%`;

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ minHeight: 24, marginBottom: '-8px' }}>
      {risk === 'moderate' && <Icon.InfoCircle fill={textColor} />}
      {risk === 'high' && <Icon.ErrorTriangle fill={textColor}/>}

      <Typography variant="body2" sx={{ color: textColor }} ml={4}>
        <span>{strings.priceImpact}</span>
        <span>{' = '}</span>
        <span style={{ paddingRight: 10 }}>{formatted}</span>
      </Typography>
    </Stack>
  );
};

export default PriceImpact;
