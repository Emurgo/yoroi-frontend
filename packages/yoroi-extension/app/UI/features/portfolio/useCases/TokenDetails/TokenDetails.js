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
import { useHistory } from 'react-router-dom';
import TransactionHistory from '../../common/TransactionHistory';
import TokenDetailChart from '../../common/TokenDetailChart';
import SubMenu from '../../../../../components/topbar/SubMenu';
import Arrow from '../../../../components/icons/portfolio/Arrow';
import { useTheme } from '@mui/material/styles';
import mockData from '../../../../pages/portfolio/mockData';

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

const TokenDetails = ({ tokenInfo, subMenuOptions, mockHistory }) => {
  const theme = useTheme();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0].route);
  const [isLoading, setIsLoading] = useState(false);

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
          onClick={() => history.push('/portfolio')}
          sx={{ color: theme.palette.ds.black_static, display: 'flex', gap: theme.spacing(2) }}
        >
          <BackIcon />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Back to Portfolio
          </Typography>
        </Button>
        <Stack direction="row" spacing={theme.spacing(2)}>
          <StyledButton variant="contained">SWAP</StyledButton>
          <StyledButton variant="secondary">SEND</StyledButton>
          <StyledButton variant="secondary">RECEIVE</StyledButton>
        </Stack>
      </Header>

      <TokenInfo direction="row" spacing={theme.spacing(4)}>
        <Card>
          <Box sx={{ padding: '20px' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, marginBottom: '15px' }}>
              {isLoading ? (
                <StyledSkeleton width="82px" height="16px" />
              ) : (
                `${tokenInfo.overview.tokenName} balance`
              )}
            </Typography>

            {isLoading ? (
              <StyledSkeleton width="146px" height="24px" />
            ) : (
              <Stack direction="row" spacing={theme.spacing(0.5)}>
                <Typography variant="h2" sx={{ fontWeight: 500 }}>
                  200000,00
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    marginTop: '5px',
                  }}
                >
                  {tokenInfo.overview.tokenName}
                </Typography>
              </Stack>
            )}

            {isLoading ? (
              <StyledSkeleton width="129px" height="16px" sx={{ marginTop: '10px' }} />
            ) : (
              <Typography variant="body1" sx={{ color: theme.palette.ds.text_gray_medium }}>
                680,00 USD
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ padding: '20px' }}>
            <Stack direction="row" justifyContent="space-between">
              {isLoading ? (
                <StyledSkeleton width="131px" height="13px" />
              ) : (
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Market price
                </Typography>
              )}
              <Stack direction="row" gap={2} alignItems="center">
                {isLoading ? (
                  <StyledSkeleton width="64px" height="13px" />
                ) : (
                  <Stack direction="row" alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                      0,48
                    </Typography>
                    &nbsp;USD
                  </Stack>
                )}
                <StyledTooltip
                  title={
                    <>
                      <Typography display={'block'}>Token price change</Typography>
                      <Typography display={'block'}>in 24 hours</Typography>
                    </>
                  }
                  placement="top"
                >
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <Chip
                        label={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Arrow
                              fill={theme.palette.ds.secondary_c800}
                              style={{ marginRight: '5px' }}
                            />
                            <Typography>0,03%</Typography>
                          </Stack>
                        }
                        sx={{
                          backgroundColor: theme.palette.ds.secondary_c100,
                          color: theme.palette.ds.secondary_c800,
                        }}
                      ></Chip>
                    )}

                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <Chip
                        label={<Typography>+0,03 USD</Typography>}
                        sx={{
                          backgroundColor: theme.palette.ds.secondary_c100,
                          color: theme.palette.ds.secondary_c800,
                        }}
                      ></Chip>
                    )}
                  </Stack>
                </StyledTooltip>
              </Stack>
            </Stack>
            <TokenDetailChart isLoading={isLoading} />
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
                      <Typography variant="body1" sx={{ fontWeight: 500, marginBottom: '20px' }}>
                        {tokenInfo.overview.tokenName}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Description
                      </Typography>
                    )}
                    {isLoading ? (
                      <>
                        <StyledSkeleton height="20px" width="full" />
                        <StyledSkeleton height="20px" width="full" />
                        <StyledSkeleton height="20px" width="127px" />
                      </>
                    ) : (
                      <Typography variant="body1" sx={{ color: theme.palette.ds.text_gray_medium }}>
                        {tokenInfo.overview.description}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={theme.spacing(1)}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Website
                      </Typography>
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
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Policy ID
                      </Typography>
                    )}

                    <Stack direction="row" spacing={theme.spacing(2)} alignItems="self-start">
                      {isLoading ? (
                        <Box flex={1}>
                          <StyledSkeleton height="20px" width="full" />
                          <StyledSkeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
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
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Fingerprint
                      </Typography>
                    )}

                    <Stack direction="row" spacing={2} alignItems="self-start">
                      {isLoading ? (
                        <Box flex={1}>
                          <StyledSkeleton height="20px" width="full" />
                          <StyledSkeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
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
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Details on
                      </Typography>
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
                <Typography variant="body1" sx={{ fontWeight: 500, marginBottom: '30px' }}>
                  Market data
                </Typography>
                <Stack direction="column" spacing={2.3}>
                  {mockData.TokenDetails.performanceItemList.map((item, index) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body1" sx={{ color: theme.palette.ds.text_gray_medium }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body1">{tokenInfo.performance[index].value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </TabContent>
            ) : null}
          </Box>
        </Card>
      </TokenInfo>

      <TransactionHistory history={mockHistory} />
    </Box>
  );
};

export default TokenDetails;
