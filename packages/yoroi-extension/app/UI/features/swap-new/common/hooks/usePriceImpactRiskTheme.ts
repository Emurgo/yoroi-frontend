import { useTheme } from '@mui/material';

export type SwapPriceImpactRisk = 'none' | 'moderate' | 'high';

export const usePriceImpactRiskThemeWeb = (risk: SwapPriceImpactRisk) => {
  const theme = useTheme() as any;
  const ds = theme.palette.ds ?? {};

  if (risk === 'high') {
    return {
      text: ds?.sys_magenta_500 ?? ds?.error?.main,
      background: ds?.sys_magenta_100 ?? ds?.error?.light,
    };
  }

  if (risk === 'moderate') {
    return {
      text: ds?.sys_orange_500 ?? ds?.warning?.main,
      background: ds?.sys_orange_100 ?? ds?.warning?.light,
    };
  }

  return {
    text: ds?.grey_900 ?? ds?.text_gray_medium,
    background: ds?.grey_50 ?? ds?.background?.paper,
  };
};
