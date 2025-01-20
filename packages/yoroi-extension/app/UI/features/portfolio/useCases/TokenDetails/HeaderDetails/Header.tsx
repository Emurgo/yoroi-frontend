import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { isEmpty } from 'lodash';
import React from 'react';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { DEFAULT_FIAT_PAIR } from '../../../common/helpers/constants';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../../module/PortfolioTokenActivityProvider';
import { bigNumberToBigInt } from '../../TokensTable/TableColumnsChip';
import { HiddenAmount } from '../../../common/components/HiddenAmount';

interface Props {
  tokenInfo: TokenInfoType;
}

const HeaderSection = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount, walletBalance, accountPair, primaryTokenInfo, isHiddenAmount } = usePortfolio();
  const isPrimaryToken: boolean = tokenInfo.id === '-';
  const tokenTotalAmount = isPrimaryToken ? walletBalance?.ada : tokenInfo.formatedAmount;
  if (tokenInfo.quantity === null) {
    return <></>;
  }

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

  const totaPriceCalc = React.useMemo(() => {
    if (!isPrimaryToken && !isEmpty(data24h)) {
      const tokenPrice = data24h && data24h[tokenInfo.info.id][1]?.price?.close;
      const tokenQuantityAsBigInt = bigNumberToBigInt(new BigNumber(tokenInfo.quantity));
      const tokenDecimals = !isPrimaryToken && tokenInfo.info.numberOfDecimals;

      if (tokenPrice === undefined && !isPrimaryToken) {
        return '-';
      }

      const totaPrice = atomicBreakdown(tokenQuantityAsBigInt, tokenDecimals)
        .bn.times(tokenPrice ?? 1)
        .times(String(ptPrice))
        .toFormat(tokenDecimals);
      return totaPrice;
    }
    return 0;
  }, [data24h, ptPrice]);

  const ptValue = accountPair?.from.name === primaryTokenInfo.name
    ? accountPair?.to.value
    : accountPair?.from.value;

  return (
    <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
      <Typography fontWeight="500" color="ds.gray_900">
        {strings.balance}
      </Typography>

      <Stack direction="column" spacing={theme.spacing(0.5)}>
        <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-start">
          <Typography variant="h2" fontWeight="500" color="ds.gray_max">
            <HiddenAmount isHidden={isHiddenAmount}>
              {tokenTotalAmount}
            </HiddenAmount>
          </Typography>
          <Typography
            variant="body2"
            fontWeight="500"
            color="ds.gray_max"
            sx={{
              paddingTop: `${theme.spacing(1.3)}`,
            }}
          >
            {tokenInfo.info.name}
          </Typography>
        </Stack>

        <Typography color="ds.gray_600">
          <HiddenAmount isHidden={isHiddenAmount}>
            {isPrimaryToken ? ptValue : totaPriceCalc}
          </HiddenAmount>
          <span>&nbsp;{isPrimaryToken && unitOfAccount === primaryTokenInfo.name ? DEFAULT_FIAT_PAIR : unitOfAccount}</span>
        </Typography>
      </Stack>
    </Stack>
  );
};

export default HeaderSection;
