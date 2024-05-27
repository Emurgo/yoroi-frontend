import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ReactComponent as BackIcon } from '../../../../../assets/images/assets-page/back-arrow.inline.svg';
import { styled } from '@mui/material/styles';
import { StyledTooltip, StyledSkeleton, CopyButton, Card } from '../../../../components';
import { tableCellClasses } from '@mui/material/TableCell';
import TransactionTable from './TransactionTable';
import TokenDetailChart from './TokenDetailChart';
import SubMenu from '../../../../../components/topbar/SubMenu';
import Arrow from '../../../../components/icons/portfolio/Arrow';
import { useTheme } from '@mui/material/styles';
import mockData from '../../../../pages/portfolio/mockData';
import { useNavigateTo } from '../../common/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StyledChip from '../../common/chip';
import ArrowIcon from '../../../../components/icons/portfolio/Arrow';
import TokenDetailPerformance from './TokenDetailPerformance';
import TokenDetailOverview from './TokenDetailOverview';

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
  marginTop: '25px',
});

const StyledButton = styled(Button)(({ theme }) => ({
  maxHeight: '40px',
  width: '100%',
  maxWidth: '140,25px',
}));

const TabContent = styled(Box)({
  flex: 1,
});

const TokenDetails = ({ tokenInfo, mockHistory }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const { strings } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);

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
          <Typography variant="body2" fontWeight="500">
            {strings.backToPortfolio}
          </Typography>
        </Button>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <StyledButton variant="contained">
            <Typography variant="button2">{strings.swap}</Typography>
          </StyledButton>
          <StyledButton variant="secondary">
            <Typography variant="button2">{strings.send}</Typography>
          </StyledButton>
          <StyledButton variant="secondary">
            <Typography variant="button2">{strings.receive}</Typography>
          </StyledButton>
        </Stack>
      </Header>

      <TokenInfo direction="row" spacing={theme.spacing(4)}>
        <Card>
          <Box sx={{ padding: '20px' }}>
            <Typography
              fontWeight="500"
              sx={{ marginBottom: theme.spacing(2), color: theme.palette.ds.text_gray_normal }}
            >
              {isLoading ? (
                <StyledSkeleton width="82px" height="16px" />
              ) : (
                `${tokenInfo.name} ${strings.balance}`
              )}
            </Typography>

            {isLoading ? (
              <StyledSkeleton width="146px" height="24px" />
            ) : (
              <Stack direction="row" spacing={theme.spacing(0.5)}>
                <Typography variant="h2" fontWeight="500">
                  {tokenInfo.totalAmount}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="500"
                  sx={{
                    marginTop: '5px',
                  }}
                >
                  {tokenInfo.name}
                </Typography>
              </Stack>
            )}

            {isLoading ? (
              <StyledSkeleton width="129px" height="16px" sx={{ marginTop: '10px' }} />
            ) : (
              <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                {tokenInfo.totalAmountUsd} USD
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ padding: '20px' }}>
            <Stack direction="row" justifyContent="space-between">
              {isLoading ? (
                <StyledSkeleton width="131px" height="13px" />
              ) : (
                <Typography fontWeight="500">{strings.marketPrice}</Typography>
              )}
              <Stack direction="row" gap={2} alignItems="center">
                {isLoading ? (
                  <StyledSkeleton width="64px" height="13px" />
                ) : (
                  <Stack direction="row" alignItems="center">
                    <Typography variant="h5" fontWeight="500">
                      {tokenInfo.price}
                    </Typography>
                    &nbsp;USD
                  </Stack>
                )}
                <StyledTooltip
                  title={
                    <>
                      <Typography display={'block'}>{strings.tokenPriceChange}</Typography>
                      <Typography display={'block'}>{strings.in24hours}</Typography>
                    </>
                  }
                  placement="top"
                >
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <StyledChip
                        active={tokenInfo.price > 0}
                        label={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <ArrowIcon
                              fill={
                                tokenInfo.price > 0
                                  ? theme.palette.ds.secondary_c800
                                  : theme.palette.ds.sys_magenta_c700
                              }
                              style={{
                                marginRight: '5px',
                                transform: tokenInfo.price > 0 ? '' : 'rotate(180deg)',
                              }}
                            />
                            <Typography>{tokenInfo.price}%</Typography>
                          </Stack>
                        }
                      />
                    )}

                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <StyledChip
                        active={tokenInfo.totalAmountUsd > 0}
                        label={
                          <Typography>
                            {tokenInfo.totalAmountUsd > 0 ? '+' : '-'}
                            {tokenInfo.totalAmountUsd} USD
                          </Typography>
                        }
                      />
                    )}
                  </Stack>
                </StyledTooltip>
              </Stack>
            </Stack>
            <TokenDetailChart isLoading={isLoading} data={tokenInfo.chartData} />
          </Box>
        </Card>

        <Card>
          <Box sx={{ paddingTop: `${theme.spacing(2)}` }}>
            <SubMenu
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
                <TokenDetailPerformance tokenInfo={tokenInfo} />
              </TabContent>
            ) : null}

            {selectedTab === subMenuOptions[1].route ? (
              <TabContent>
                <TokenDetailOverview tokenInfo={tokenInfo} isLoading={isLoading} />
              </TabContent>
            ) : null}
          </Box>
        </Card>
      </TokenInfo>

      <TransactionTable history={mockHistory} />
    </Box>
  );
};

export default TokenDetails;
