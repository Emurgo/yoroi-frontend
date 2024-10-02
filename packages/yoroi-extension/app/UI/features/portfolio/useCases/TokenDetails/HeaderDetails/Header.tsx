import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import React from 'react';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../../module/PortfolioTokenActivityProvider';
import { bigNumberToBigInt } from '../../TokensTable/TableColumnsChip';

interface Props {
  tokenInfo: TokenInfoType;
}

const HeaderSection = ({ tokenInfo }: Props): JSX.Element => {
  console.log('tokenInfo', tokenInfo);
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount, walletBalance } = usePortfolio();
  const isPrimaryToken: boolean = tokenInfo.id === '-';
  console.log('isPrimaryToken', isPrimaryToken);
  const tokenTotalAmount = isPrimaryToken ? walletBalance?.ada : tokenInfo.formatedAmount;

  if (tokenInfo.quantity === null) {
    return <></>;
  }

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const {
    tokenActivity: { data24h },
    // isLoading: isActivityLoading,
  } = usePortfolioTokenActivity();

  const totaPriceCalc = React.useMemo(() => {
    if (!isPrimaryToken && data24h) {
      const tokenPrice = data24h && data24h[tokenInfo.info.id][1]?.price.close;
      const tokenQuantityAsBigInt = bigNumberToBigInt(new BigNumber(tokenInfo.quantity));
      const tokenDecimals = !isPrimaryToken && tokenInfo.info.numberOfDecimals;

      const totaPrice = atomicBreakdown(tokenQuantityAsBigInt, tokenDecimals)
        .bn.times(tokenPrice ?? 1)
        .times(String(ptPrice))
        .toFormat(tokenDecimals);
      return totaPrice;
    }
    return 0;
  }, [data24h, ptPrice]);

  return (
    <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
      <Typography fontWeight="500" color="ds.gray_900">
        {`${tokenInfo.info.name} ${strings.balance}`}
      </Typography>

      <Stack direction="column" spacing={theme.spacing(0.5)}>
        <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-end">
          <Typography variant="h2" fontWeight="500" color="ds.gray_max">
            {tokenTotalAmount}
          </Typography>
          <Typography
            variant="body2"
            fontWeight="500"
            color="ds.text_gray_low"
            sx={{
              padding: `${theme.spacing(1)} 0`,
            }}
          >
            {tokenInfo.info.name}
          </Typography>
        </Stack>

        <Typography color="ds.gray_600">
          {isPrimaryToken ? tokenInfo.formatedAmount : totaPriceCalc}{' '}
          {isPrimaryToken && unitOfAccount === 'ADA' ? 'USD' : unitOfAccount}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default HeaderSection;
