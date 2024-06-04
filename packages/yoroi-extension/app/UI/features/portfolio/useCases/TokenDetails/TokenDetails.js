import React, { useEffect, useState } from 'react';
import { Badge, Box, Button, Chip, Divider, IconButton, Link, Stack, Typography } from '@mui/material';
import { ReactComponent as BackIcon } from '../../../../../assets/images/assets-page/back-arrow.inline.svg';
import { styled } from '@mui/material/styles';
import { Skeleton, CopyButton, Card } from '../../../../components';
import { tableCellClasses } from '@mui/material/TableCell';
import TransactionTable from './TransactionTable';
import TokenDetailChart from './TokenDetailChart';
import SubMenu from '../../../../../components/topbar/SubMenu';
import { useTheme } from '@mui/material/styles';
import { useNavigateTo } from '../../common/useNavigateTo';
import { useStrings } from '../../common/useStrings';
import mockData from '../../common/mockData';
import TokenDetailPerformance from './TokenDetailPerformance';
import TokenDetailOverview from './TokenDetailOverview';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
});

const StyledButton = styled(Button)(({ theme }) => ({
  maxHeight: '40px',
  minWidth: '140.25px',

  '&.MuiButton-contained': {
    backgroundColor: theme.palette.ds.el_primary_medium,
    color: theme.palette.ds.el_static_white,

    '&:hover': {
      backgroundColor: theme.palette.ds.el_primary_high,
    },
  },

  '&.MuiButton-secondary': {
    color: theme.palette.ds.text_primary_medium,
  },
}));

const TabContent = styled(Box)({
  flex: 1,
});

const StyledSubMenu = styled(SubMenu)(({ theme }) => ({
  '& > .SubMenuItem_enabled > button': {
    padding: '11px 0 !important',
    color: theme.palette.ds.el_primary_medium,
    borderColor: theme.palette.ds.el_primary_medium,
  },
}));

const TokenDetails = ({ tokenInfo, transactionHistory }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);
  const isAda = tokenInfo.name.toLowerCase() === 'ada';

  const subMenuOptions = [
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

  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0].route);

  const isActiveItem: string => boolean = route => {
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
          <Typography variant="body2" fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
            {strings.backToPortfolio}
          </Typography>
        </Button>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <StyledButton variant="contained" onClick={() => navigateTo.swapPage()}>
            <Typography variant="button2">{strings.swap}</Typography>
          </StyledButton>
          <StyledButton variant="secondary" onClick={() => navigateTo.sendPage()}>
            <Typography variant="button2">{strings.send}</Typography>
          </StyledButton>
          <StyledButton variant="secondary" onClick={() => navigateTo.receivePage()}>
            <Typography variant="button2">{strings.receive}</Typography>
          </StyledButton>
        </Stack>
      </Header>

      <Stack direction="column" spacing={theme.spacing(3)} sx={{ marginTop: theme.spacing(2) }}>
        <TokenInfo direction="row" spacing={theme.spacing(3)}>
          <Card>
            <Stack direction="column" spacing={theme.spacing(2)} sx={{ padding: theme.spacing(3) }}>
              <Typography fontWeight="500" sx={{ color: theme.palette.ds.gray_c900 }}>
                {isLoading ? <Skeleton width="82px" height="16px" /> : `${tokenInfo.name} ${strings.balance}`}
              </Typography>

              <Stack direction="column" spacing={theme.spacing(0.5)}>
                {isLoading ? (
                  <Skeleton width="146px" height="24px" />
                ) : (
                  <Stack direction="row" spacing={theme.spacing(0.25)} alignItems="flex-end">
                    <Typography variant="h2" fontWeight="500" sx={{ color: theme.palette.ds.gray_cmax }}>
                      {tokenInfo.totalAmount}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{
                        color: theme.palette.ds.black_static,
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
                  <Typography sx={{ color: theme.palette.ds.gray_c600 }}>
                    {tokenInfo.totalAmountUsd} {unitOfAccount}
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
                onItemClick={route => setSelectedTab(route)}
                isActiveItem={isActiveItem}
                locationId="token-details"
              />
              <Divider sx={{ margin: `0 ${theme.spacing(2)}` }} />
            </Box>
            <Box sx={{ padding: theme.spacing(3) }}>
              {selectedTab === subMenuOptions[0].route ? (
                <TabContent>
                  <TokenDetailPerformance tokenInfo={tokenInfo} isLoading={isLoading} />
                </TabContent>
              ) : null}

              {selectedTab === subMenuOptions[1].route ? (
                <TabContent>
                  <TokenDetailOverview tokenInfo={tokenInfo} isLoading={isLoading} isAda={isAda} />
                </TabContent>
              ) : null}
            </Box>
          </Card>
        </TokenInfo>

        <TransactionTable history={transactionHistory} />
      </Stack>
    </Box>
  );
};

export default TokenDetails;
