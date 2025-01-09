import { Box, Divider, Stack } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { ampli } from '../../../../../../ampli';
import { BackButton, Card } from '../../../../components';
import NavigationButton from '../../common/components/NavigationButton';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { PortfolioDetailsTab } from '../../module/PortfolioContextProvider';
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

const TokenDetails = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const isPrimaryToken: boolean = tokenInfo.id === '-';

  useEffect(() => {
    ampli.portfolioTokenDetails({ token_details_tab: PortfolioDetailsTab.Overview });
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Header>
        <BackButton label={strings.backToPortfolio} onAction={() => navigateTo.portfolio()} />
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
