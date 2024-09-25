import { Box, Divider, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { ReactComponent as BackIcon } from '../../../../../assets/images/assets-page/back-arrow.inline.svg';
import { Card } from '../../../../components';
import NavigationButton from '../../common/components/NavigationButton';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { TokenChartInterval } from './ChartDetails/TokenChartInterval';
import HeaderSection from './HeaderDetails/Header';
import OverviewPerformance from './OverviewPerformanceDetails/OverviewPerformance';

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
});

interface Props {
  tokenInfo: TokenInfoType;
}

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

const TokenDetails = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount, walletBalance } = usePortfolio();
  const isPrimaryToken: boolean = tokenInfo.id === '-';
  const tokenTotalAmount = isPrimaryToken ? walletBalance?.ada : tokenInfo.totalAmount;

  return (
    <Box sx={{ width: '100%' }}>
      <Header>
        <Box
          height="40px"
          onClick={() => navigateTo.portfolio()}
          sx={{
            color: theme.palette.ds.black_static,
            display: 'flex',
            gap: theme.spacing(2),
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <IconWrapper>
            <BackIcon />
          </IconWrapper>
          <Typography variant="body2" fontWeight="500" color="ds.text_gray_medium" sx={{ textTransform: 'uppercase' }}>
            {strings.backToPortfolio}
          </Typography>
        </Box>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <NavigationButton variant="primary" onClick={() => navigateTo.swapPage(tokenInfo.info.id)} label={strings.swap} />
          <NavigationButton variant="secondary" onClick={() => navigateTo.sendPage()} label={strings.send} />
          <NavigationButton variant="secondary" onClick={() => navigateTo.receivePage()} label={strings.receive} />
        </Stack>
      </Header>

      <Stack direction="column" spacing={theme.spacing(3)} sx={{ marginTop: theme.spacing(2) }}>
        <TokenInfo direction={isPrimaryToken ? 'row' : 'column'} spacing={theme.spacing(3)}>
          <Card>
            <HeaderSection tokenInfo={tokenInfo} />
            <Divider />
            <TokenChartInterval tokenInfo={tokenInfo} />
          </Card>

          <OverviewPerformance tokenInfo={tokenInfo} />
        </TokenInfo>

        {/* <TransactionTable history={mockData.transactionHistory} tokenName={tokenInfo.name} /> */}
      </Stack>
    </Box>
  );
};

export default TokenDetails;
