import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { ReactComponent as BackIcon } from '../../../../../assets/images/assets-page/back-arrow.inline.svg';
import { styled } from '@mui/material/styles';
import { Skeleton, Card } from '../../../../components';
import TransactionTable from './TransactionTable';
import TokenDetailChart from './TokenDetailChart';
import SubMenu from '../../../../../components/topbar/SubMenu';
import { useTheme } from '@mui/material/styles';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import TokenDetailPerformance from './TokenDetailPerformance';
import TokenDetailOverview from './TokenDetailOverview';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { SubMenuOption, TokenType } from '../../common/types/index';
import NavigationButton from '../../common/components/NavigationButton';
import mockData from '../../common/mockData';
import { formatNumber } from '../../common/helpers/formatHelper';

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

const StyledSubMenu = styled(SubMenu)(({ theme }) => ({
  '& > button': {
    padding: '11px 0 !important',
  },

  '& > .SubMenuItem_enabled': {
    color: theme.palette.ds.el_primary_medium,
    borderColor: theme.palette.ds.el_primary_medium,
  },
}));

interface Props {
  tokenInfo: TokenType;
}

const TokenDetails = ({ tokenInfo }: Props): JSX.Element => {
  const theme: any = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);
  const isAda = tokenInfo.name.toLowerCase() === 'ada';

  const subMenuOptions: SubMenuOption[] = [
    {
      label: strings.performance,
      className: 'performance',
      route: 'performance',
    },
    {
      label: strings.overview,
      className: 'overview',
      route: 'overview',
    },
  ];

  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0]?.route);

  const isActiveItem = (route: string) => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    // FAKE FETCHING DATA TO SEE SKELETON
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Header>
        <Button
          onClick={() => navigateTo.portfolio()}
          sx={{ color: theme.palette.ds.black_static, display: 'flex', gap: theme.spacing(2) }}
        >
          <BackIcon />
          <Typography variant="body2" fontWeight="500" color="ds.text_gray_normal">
            {strings.backToPortfolio}
          </Typography>
        </Button>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <NavigationButton variant="contained" onClick={() => navigateTo.swapPage()} label={strings.swap} />
          <NavigationButton variant="secondary" onClick={() => navigateTo.sendPage()} label={strings.send} />
          <NavigationButton variant="secondary" onClick={() => navigateTo.receivePage()} label={strings.receive} />
        </Stack>
      </Header>

      <Stack direction="column" spacing={theme.spacing(3)} sx={{ marginTop: theme.spacing(2) }}>
        <TokenInfo direction="row" spacing={theme.spacing(3)}>
          <Card>
            <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
              <Typography fontWeight="500" color="ds.gray_c900">
                {isLoading ? <Skeleton width="82px" height="16px" /> : `${tokenInfo.name} ${strings.balance}`}
              </Typography>

              <Stack direction="column" spacing={theme.spacing(0.5)}>
                {isLoading ? (
                  <Skeleton width="146px" height="24px" />
                ) : (
                  <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-end">
                    <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
                      {formatNumber(tokenInfo.totalAmount)}
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
                  <Typography color="ds.gray_c600">
                    {formatNumber(tokenInfo.totalAmountUsd)} {isAda && unitOfAccount === 'ADA' ? 'USD' : unitOfAccount}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider />

            <TokenDetailChart isLoading={isLoading} tokenInfo={tokenInfo} isAda={isAda} />
          </Card>

          <Card>
            <Box sx={{ paddingTop: `${theme.spacing(2)}` }}>
              <StyledSubMenu
                options={subMenuOptions}
                onItemClick={(route: string) => setSelectedTab(route)}
                isActiveItem={isActiveItem}
                locationId="token-details"
              />
              <Divider sx={{ margin: `0 ${theme.spacing(2)}` }} />
            </Box>
            <Box sx={{ padding: theme.spacing(3) }}>
              {selectedTab === subMenuOptions[0]?.route ? (
                <TabContent>
                  <TokenDetailPerformance tokenInfo={tokenInfo} isLoading={isLoading} />
                </TabContent>
              ) : null}

              {selectedTab === subMenuOptions[1]?.route ? (
                <TabContent>
                  <TokenDetailOverview tokenInfo={tokenInfo} isLoading={isLoading} isAda={isAda} />
                </TabContent>
              ) : null}
            </Box>
          </Card>
        </TokenInfo>

        <TransactionTable history={mockData.transactionHistory} />
      </Stack>
    </Box>
  );
};

export default TokenDetails;
