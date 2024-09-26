import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';

interface Props {
  tokenInfo: TokenInfoType;
}

const HeaderSection = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount, walletBalance } = usePortfolio();
  const isPrimaryToken: boolean = tokenInfo.id === '-';
  const tokenTotalAmount = isPrimaryToken ? walletBalance?.ada : tokenInfo.totalAmount;

  // const {
  //   tokenActivity: { data24h },
  //   // isLoading: isActivityLoading,
  // } = usePortfolioTokenActivity();
  // const tokenPrice = data24h && data24h[1].price.close;
  // // TODOOOO

  return (
    <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
      <Typography fontWeight="500" color="ds.gray_900">
        {`${tokenInfo.name} ${strings.balance}`}
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
            {tokenInfo.name}
          </Typography>
        </Stack>

        <Typography color="ds.gray_600">
          {tokenInfo.totalAmountFiat} {isPrimaryToken && unitOfAccount === 'ADA' ? 'USD' : unitOfAccount}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default HeaderSection;
