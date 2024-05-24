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
import StyledChip from '../../../../components/chip';
import ArrowIcon from '../../../../components/icons/portfolio/Arrow';

const PerformanceItemType = {
  USD: 'usd',
  TOKEN: 'token',
  RANK: 'rank',
};

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
});

const TokenInfo = styled(Stack)({
  width: '100%',
  marginTop: '25px',
});

const StyledButton = styled(Button)({
  maxHeight: '40px',
});

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
      label: strings.overview,
      className: 'overview',
      route: 'overview',
    },
    {
      label: strings.performance,
      className: 'performance',
      route: 'performance',
    },
  ];

  const performanceItemList = [
    { id: 'tokenPriceChange', type: PerformanceItemType.USD, label: strings.tokenPriceChange },
    { id: 'tokenPrice', type: PerformanceItemType.USD, label: strings.tokenPrice },
    { id: 'marketCap', type: PerformanceItemType.USD, label: strings.marketCap },
    { id: 'volumn', type: PerformanceItemType.USD, label: strings['24hVolumn'] },
    { id: 'rank', type: PerformanceItemType.RANK, label: strings.rank },
    { id: 'circulating', type: PerformanceItemType.TOKEN, label: strings.circulating },
    { id: 'totalSupply', type: PerformanceItemType.TOKEN, label: strings.totalSupply },
    { id: 'maxSupply', type: PerformanceItemType.TOKEN, label: strings.maxSupply },
    { id: 'allTimeHigh', type: PerformanceItemType.USD, label: strings.allTimeHigh },
    { id: 'allTimeLow', type: PerformanceItemType.USD, label: strings.allTimeLow },
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
          <StyledButton variant="contained">{strings.swap}</StyledButton>
          <StyledButton variant="secondary">{strings.send}</StyledButton>
          <StyledButton variant="secondary">{strings.receive}</StyledButton>
        </Stack>
      </Header>

      <TokenInfo direction="row" spacing={theme.spacing(4)}>
        <Card>
          <Box sx={{ padding: '20px' }}>
            <Typography fontWeight="500" sx={{ marginBottom: '15px' }}>
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
          <Box sx={{ marginTop: '20px' }}>
            <SubMenu
              options={subMenuOptions}
              onItemClick={route => setSelectedTab(route)}
              isActiveItem={isActiveItem}
              locationId="token-details"
            />
            <Divider sx={{ margin: '0 20px' }} />
          </Box>
          <Box sx={{ padding: '30px 20px' }}>
            {selectedTab === subMenuOptions[0].route ? (
              <TabContent>
                <Stack direction="column" spacing={theme.spacing(1.5)}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={theme.spacing(1)}
                    sx={{ margin: '10px 0' }}
                  >
                    {isLoading ? (
                      <StyledSkeleton width="32px" height="32px" />
                    ) : (
                      <Box
                        width="32px"
                        height="32px"
                        sx={{
                          backgroundColor: theme.palette.ds.gray_c300,
                          borderRadius: `${theme.shape.borderRadius}px`,
                        }}
                      ></Box>
                    )}
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography fontWeight="500" sx={{ marginBottom: '20px' }}>
                        {tokenInfo.overview.tokenName}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography fontWeight="500">{strings.description}</Typography>
                    )}
                    {isLoading ? (
                      <>
                        <StyledSkeleton height="20px" width="full" />
                        <StyledSkeleton height="20px" width="full" />
                        <StyledSkeleton height="20px" width="127px" />
                      </>
                    ) : (
                      <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                        {tokenInfo.overview.description}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography fontWeight="500">{strings.website}</Typography>
                    )}
                    {isLoading ? (
                      <StyledSkeleton width="127px" height="20px" />
                    ) : (
                      <Link href={tokenInfo.overview.website} target="_blank">
                        cardano.org
                      </Link>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="84px" height="20px" />
                    ) : (
                      <Typography fontWeight="500">{strings.policyId}</Typography>
                    )}

                    <Stack direction="row" spacing={theme.spacing(2)} alignItems="self-start">
                      {isLoading ? (
                        <Box flex={1}>
                          <StyledSkeleton height="20px" width="full" />
                          <StyledSkeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                        </Box>
                      ) : (
                        <Typography
                          sx={{ color: theme.palette.ds.text_gray_medium, wordBreak: 'break-word' }}
                        >
                          {tokenInfo.overview.policyId}
                        </Typography>
                      )}
                      <CopyButton
                        disabled={isLoading}
                        textToCopy={`${tokenInfo.overview.policyId}`}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="84px" height="20px" />
                    ) : (
                      <Typography fontWeight="500">{strings.fingerprint}</Typography>
                    )}

                    <Stack direction="row" spacing={2} alignItems="self-start">
                      {isLoading ? (
                        <Box flex={1}>
                          <StyledSkeleton height="20px" width="full" />
                          <StyledSkeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                        </Box>
                      ) : (
                        <Typography
                          sx={{ color: theme.palette.ds.text_gray_medium, wordBreak: 'break-word' }}
                        >
                          {tokenInfo.overview.fingerprint}
                        </Typography>
                      )}
                      <CopyButton
                        disabled={isLoading}
                        textToCopy={`${tokenInfo.overview.fingerprint}`}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography fontWeight="500">{strings.detailsOn}</Typography>
                    )}
                    <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                      {isLoading ? (
                        <StyledSkeleton width="127px" height="20px" />
                      ) : (
                        <Link href={tokenInfo.overview.detailOn} target="_blank">
                          Cardanoscan
                        </Link>
                      )}
                      {isLoading ? (
                        <StyledSkeleton height="20px" width="60px" />
                      ) : (
                        <Button variant="text" sx={{ maxHeight: '22px' }}>
                          Adaex
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </TabContent>
            ) : null}

            {selectedTab === subMenuOptions[1].route ? (
              <TabContent>
                <Typography fontWeight="500" sx={{ marginBottom: '30px' }}>
                  Market data
                </Typography>
                <Stack direction="column" spacing={2.3}>
                  {performanceItemList.map((item, index) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                        {item.label}
                      </Typography>
                      <Typography>
                        {item.type === PerformanceItemType.RANK && '#'}
                        {tokenInfo.performance[index].value}{' '}
                        {item.type === PerformanceItemType.USD && 'USD'}
                        {item.type === PerformanceItemType.TOKEN && tokenInfo.overview.tokenName}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
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
