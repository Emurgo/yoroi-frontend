import { Box, Divider, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { ReactComponent as BackIcon } from '../../../../../assets/images/assets-page/back-arrow.inline.svg';
import { Card, Skeleton } from '../../../../components';
import Menu from '../../common/components/Menu';
import NavigationButton from '../../common/components/NavigationButton';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import mockData from '../../common/mockData';
import { SubMenuOption, TokenType } from '../../common/types/index';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { TokenChartInterval } from './TokenChartInterval';
import TokenDetailOverview from './TokenDetailOverview';
import TokenDetailPerformance from './TokenDetailPerformance';
import TransactionTable from './TransactionTable';

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
});

const TabContent = styled(Box)({
  flex: 1,
});

interface Props {
  tokenInfo: TokenType;
}

const TokenDetails = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount, walletBalance } = usePortfolio();
  const [isLoading, _] = useState<boolean>(false);
  const isPrimaryToken: boolean = tokenInfo.id === '-';
  const tokenTotalAmount = isPrimaryToken ? walletBalance.ada : tokenInfo.totalAmount;

  const subMenuOptions: SubMenuOption[] = [
    {
      label: strings.overview,
      className: 'overview',
      route: 'overview',
    },
    // {
    //   label: strings.performance,
    //   className: 'performance',
    //   route: 'performance',
    // },
  ];

  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0]?.route);

  const isActiveItem = (route: string) => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

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
          <BackIcon />
          <Typography variant="body2" fontWeight="500" color="ds.text_gray_medium" sx={{ textTransform: 'uppercase' }}>
            {strings.backToPortfolio}
          </Typography>
        </Box>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <NavigationButton
            variant="contained"
            onClick={() => navigateTo.swapPage(tokenInfo.info.id}
            label={strings.swap}
          />
          <NavigationButton variant="secondary" onClick={() => navigateTo.sendPage()} label={strings.send} />
          <NavigationButton variant="secondary" onClick={() => navigateTo.receivePage()} label={strings.receive} />
        </Stack>
      </Header>

      <Stack direction="column" spacing={theme.spacing(3)} sx={{ marginTop: theme.spacing(2) }}>
        <TokenInfo direction="row" spacing={theme.spacing(3)}>
          <Card>
            <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
              <Typography fontWeight="500" color="ds.gray_900">
                {isLoading ? <Skeleton width="82px" height="16px" /> : `${tokenInfo.name} ${strings.balance}`}
              </Typography>

              <Stack direction="column" spacing={theme.spacing(0.5)}>
                {isLoading ? (
                  <Skeleton width="146px" height="24px" />
                ) : (
                  <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-end">
                    <Typography variant="h2" fontWeight="500" color="ds.gray_max">
                      {tokenTotalAmount}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      color="ds.black_static"
                      sx={{
                        padding: `${theme.spacing(1)} 0`,
                      }}
                    >
                      {tokenInfo.name}
                    </Typography>
                  </Stack>
                )}

                {isLoading ? (
                  <Skeleton width="129px" height="16px" />
                ) : (
                  <Typography color="ds.gray_600">
                    {tokenInfo.totalAmountFiat} {isPrimaryToken && unitOfAccount === 'ADA' ? 'USD' : unitOfAccount}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider />
            {isPrimaryToken && <TokenChartInterval tokenInfo={tokenInfo} isPrimaryTokents={true} />}
          </Card>

          <Card>
            <Box sx={{ paddingTop: `${theme.spacing(2)}` }}>
              <Menu options={subMenuOptions} onItemClick={(route: string) => setSelectedTab(route)} isActiveItem={isActiveItem} />
              <Divider sx={{ margin: `0 ${theme.spacing(3)}` }} />
            </Box>
            <Box sx={{ px: theme.spacing(3), pt: theme.spacing(3), pb: theme.spacing(2) }}>
              {selectedTab === subMenuOptions[0]?.route ? (
                <TabContent>
                  <TokenDetailOverview tokenInfo={tokenInfo} isLoading={isLoading} isPrimaryToken={isPrimaryToken} />
                </TabContent>
              ) : null}

              {selectedTab === subMenuOptions[1]?.route ? (
                <TabContent>
                  <TokenDetailPerformance tokenInfo={tokenInfo} isLoading={isLoading} />
                </TabContent>
              ) : null}
            </Box>
          </Card>
        </TokenInfo>

        <TransactionTable history={mockData.transactionHistory} tokenName={tokenInfo.name} />
      </Stack>
    </Box>
  );
};

export default TokenDetails;
