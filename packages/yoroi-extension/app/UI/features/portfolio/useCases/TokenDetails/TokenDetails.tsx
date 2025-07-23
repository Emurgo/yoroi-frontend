import { Box, Divider, Stack } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { observer } from 'mobx-react';
import { BackButton, Card } from '../../../../components';
import NavigationButton from '../../common/components/NavigationButton';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { TokenChartInterval } from './ChartDetails/TokenChartInterval';
import HeaderSection from './HeaderDetails/Header';
import OverviewPerformance from './OverviewPerformanceDetails/OverviewPerformance';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
});

interface Props {
  tokenInfo: TokenInfoType;
  stores: any;
}

const TokenDetails = observer(
  ({ tokenInfo, stores }: Props): React.ReactNode => {
    const theme: any = useTheme();
    const navigateTo = useNavigateTo();
    const strings = useStrings();
    const isPrimaryToken: boolean = tokenInfo.id === '-';
    const { isTestnet } = usePortfolio();

    return (
      <Box sx={{ width: '100%' }}>
        <Header>
          <BackButton label={strings.backToPortfolio} onAction={() => navigateTo.portfolio()} />
          <Stack direction="row" spacing={theme.spacing(16)}>
            {isTestnet ? null : (
              <NavigationButton variant="primary" onClick={() => navigateTo.swapPage(tokenInfo.info.id)} label={strings.swap} />
            )}
            <NavigationButton variant="secondary" onClick={() => navigateTo.sendPage()} label={strings.send} />
            <NavigationButton variant="secondary" onClick={() => navigateTo.receivePage()} label={strings.receive} />
          </Stack>
        </Header>

        <Stack direction="column" spacing={theme.spacing(24)} sx={{ marginTop: theme.spacing(16) }}>
          <TokenInfo direction={isPrimaryToken ? 'row' : 'column'} spacing={theme.spacing(24)}>
            <Card>
              <HeaderSection tokenInfo={tokenInfo} stores={stores} />
              <Divider />
              <TokenChartInterval tokenInfo={tokenInfo} />
            </Card>

            <OverviewPerformance tokenInfo={tokenInfo} />
          </TokenInfo>

          {/* <TransactionTable history={mockData.transactionHistory} tokenName={tokenInfo.name} /> */}
        </Stack>
      </Box>
    );
  }
);

export default TokenDetails;
