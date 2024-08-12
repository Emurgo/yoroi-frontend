// @flow
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useSwap } from '@yoroi/swap';
import type { Node } from 'react';
import { ReactComponent as ErrorTriangleIcon } from '../../assets/images/revamp/error.triangle.svg';
import { ReactComponent as ExclamationCircleIcon } from '../../assets/images/revamp/exclamation.circle.svg';
import { useSwapForm } from '../../containers/swap/context/swap-form';
import { Quantities } from '../../utils/quantities';
import Percent from '../common/Percent';
import Dialog from '../widgets/Dialog';
import { PRICE_PRECISION } from './common';
import type { PriceImpact } from './types';

function colorsBySeverity(isSevere: boolean) {
  const theme = useTheme();
  return isSevere
    ? { fg: theme.palette.ds.text_error, bg: theme.palette.ds.sys_magenta_c100 }
    : { fg: theme.palette.ds.sys_yellow_c500, bg: theme.palette.ds.sys_yellow_c100 };
}

export function PriceImpactColored({
  priceImpactState,
  children,
  sx,
}: {|
  priceImpactState: ?PriceImpact,
  children: Node,
  sx?: any,
|}): Node {
  const colorProps = priceImpactState ? { color: colorsBySeverity(priceImpactState.isSevere).fg } : {};
  return <span style={{ ...colorProps, ...(sx ?? {}) }}>{children}</span>;
}

export function PriceImpactIcon({ isSevere, small }: {| isSevere: boolean, small?: boolean |}): Node {
  const sz = `${small ? 16 : 24}px`;
  const marginTop = `${small ? -1 : 0}px`;
  const marginRight = `6px`;
  const svgProp = small
    ? {
        style: { transform: 'scale(0.666666666)' },
      }
    : {};
  return (
    <Box
      sx={{
        width: sz,
        height: sz,
        marginTop,
        marginRight,
        marginLeft: '-3px',
      }}
    >
      {isSevere ? <ErrorTriangleIcon {...svgProp} /> : <ExclamationCircleIcon {...svgProp} />}
    </Box>
  );
}

function PriceImpactWarningText({ isSevere }: {| isSevere: boolean |}): Node {
  const { palette } = useTheme();
  return isSevere ? (
    <Typography variant="body1" sx={{ color: palette.ds.text_gray_normal }}>
      <Typography component="span" fontWeight="500" color="ds.text_gray_normal">
        Price impact over 10%&nbsp;
      </Typography>
      may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.
    </Typography>
  ) : (
    <Typography component="div" variant="body1" color={palette.ds.text_gray_normal}>
      <Typography component="span" fontWeight="500">
        Price impact over 1%&nbsp;
      </Typography>
      may cause a difference in the amount you actually receive. Consider this at your own risk.
    </Typography>
  );
}

export function PriceImpactTitle({ isSevere, small, sx }: {| isSevere: boolean, small?: boolean, sx?: any |}): Node {
  return (
    <Box sx={{ display: 'flex', ...(sx ?? {}) }}>
      <PriceImpactIcon small={small} isSevere={isSevere} />
      <Typography
        component="div"
        color={colorsBySeverity(isSevere).fg}
        {...(small
          ? {
              variant: 'caption',
            }
          : {
              fontWeight: '500',
            })}
      >
        Price impact
      </Typography>
    </Box>
  );
}

export function PriceImpactPercent(): Node {
  const { orderData } = useSwap();
  const priceImpact = orderData.selectedPoolCalculation?.prices.priceImpact ?? '0';

  if (priceImpact <= 1) {
    return <Typography sx={{ color: 'secondary.600' }}>&lt;1%</Typography>;
  }
  return <Percent value={priceImpact} />;
}

export function FormattedPrice({ price }: {| price: string |}): Node {
  const { orderData } = useSwap();
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();
  const denomination = orderData.tokens.priceDenomination;
  return (
    <>
      {Quantities.format(price, denomination, PRICE_PRECISION)}
      &nbsp;{sellTokenInfo?.ticker}/{buyTokenInfo?.ticker}
    </>
  );
}

export function FormattedMarketPrice(): Node {
  const { orderData } = useSwap();
  const marketPrice = orderData.selectedPoolCalculation?.prices.market ?? '0';
  return <FormattedPrice price={marketPrice} />;
}

export function FormattedLimitPrice(): Node {
  const { orderData } = useSwap();
  const limitPrice = orderData.limitPrice ?? '0';
  return <FormattedPrice price={limitPrice} />;
}

export function FormattedActualPrice(): Node {
  const { orderData } = useSwap();
  const actualPrice = orderData.selectedPoolCalculation?.prices.actualPrice ?? '0';
  return <FormattedPrice price={actualPrice} />;
}

export function PriceImpactBanner({ priceImpactState }: {| priceImpactState: ?PriceImpact |}): Node {
  if (priceImpactState == null) {
    return null;
  }
  const isSevere = priceImpactState.isSevere;
  return (
    <Box component="div" bgcolor={colorsBySeverity(isSevere).bg} p="12px 17px 16px 16px" borderRadius="8px">
      <PriceImpactTitle isSevere={isSevere} sx={{ marginBottom: '8px' }} />
      <PriceImpactWarningText isSevere={isSevere} />
    </Box>
  );
}

export function PriceImpactAlert({ onContinue, onCancel }: {| onContinue: () => void, onCancel: () => void |}): Node {
  return (
    <Dialog
      title="Warning"
      onClose={onCancel}
      withCloseButton
      closeOnOverlayClick
      styleOverride={{ width: '648px', height: '216px' }}
      styleContentOverride={{ paddingTop: 0 }}
    >
      <Box display="flex" flexDirection="column">
        <PriceImpactWarningText isSevere />
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="23px">
        <Button fullWidth variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          fullWidth
          variant="primary"
          onClick={onContinue}
          sx={{
            backgroundColor: 'magenta.500',
            '&:hover': { backgroundColor: 'magenta.600' },
          }}
        >
          Continue
        </Button>
      </Box>
    </Dialog>
  );
}
