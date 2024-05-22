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
import { ReactComponent as ArrowLeft } from '../../../assets/images/assets-page/back-arrow.inline.svg';
import { ReactComponent as ArrowDown } from './images/down-arrow.inline.svg';
import { ReactComponent as ArrowUp } from './images/up-arrow.inline.svg';
import { styled } from '@mui/material/styles';
import { StyledTooltip, StyledSkeleton, CopyButton, Card } from '../../components';
import { TxInputsBuilder } from '@emurgo/cardano-serialization-lib-browser';
import { tableCellClasses } from '@mui/material/TableCell';
import { useHistory } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import TokenDetailChart from './TokenDetailChart';
import SubMenu from '../../../components/topbar/SubMenu';

const performanceItemList = [
  { id: 'tokenPriceChange', label: 'Token price change' },
  { id: 'tokenPrice', label: 'Token price' },
  { id: 'marketCap', label: 'Market cap' },
  { id: 'volumn', label: '24h volumn' },
  { id: 'rank', label: 'Rank' },
  { id: 'circulating', label: 'Circulating' },
  { id: 'totalSupply', label: 'Total supply' },
  { id: 'maxSupply', label: 'Max supply' },
  { id: 'allTimeHigh', label: 'All time high' },
  { id: 'allTimeLow', label: 'All time low' },
];

const TokenDetailsPage = ({ tokenInfo, subMenuOptions, mockHistory }) => {
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
          sx={{ color: '#000000', display: 'flex', gap: 2 }}
        >
          <ArrowLeft />
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: '22px' }}>
            Back to Portfolio
          </Typography>
        </Button>
        <Stack direction="row" spacing={2}>
          <StyledButton variant="contained">SWAP</StyledButton>
          <StyledButton variant="secondary" sx={{ boxShadow: '2px' }}>
            SEND
          </StyledButton>
          <StyledButton variant="secondary" sx={{ boxShadow: '2px' }}>
            RECEIVE
          </StyledButton>
        </Stack>
      </Header>

      <TokenInfo direction="row" spacing={4}>
        <Card>
          <Box sx={{ padding: '20px' }}>
            <Typography variant="body-1-regular" sx={{ fontWeight: 500, marginBottom: '15px' }}>
              {isLoading ? (
                <StyledSkeleton width="82px" height="16px" />
              ) : (
                `${tokenInfo.overview.tokenName} balance`
              )}
            </Typography>

            {isLoading ? (
              <StyledSkeleton width="146px" height="24px" />
            ) : (
              <Stack direction="row" spacing={0.5}>
                <Typography sx={{ fontWeight: 500, fontSize: '1.75rem', lineHeight: '2rem' }}>
                  200000,00
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: '22px',
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
              <Typography variant="body-1-regular">680,00 USD</Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ padding: '20px' }}>
            <Stack direction="row" justifyContent="space-between">
              {isLoading ? (
                <StyledSkeleton width="131px" height="13px" />
              ) : (
                <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
                  Market price
                </Typography>
              )}
              <Stack direction="row" gap={2} alignItems="center">
                {isLoading ? (
                  <StyledSkeleton width="64px" height="13px" />
                ) : (
                  <Stack direction="row" alignItems="center">
                    <Typography sx={{ fontWeight: 500, fontSize: '1.125rem', lineHeight: '24px' }}>
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <Chip
                        label={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <ArrowUp
                              fill="rgba(18, 112, 93, 1)"
                              width="10px"
                              height="10px"
                              style={{ marginRight: '5px' }}
                            />
                            <Typography>0,03%</Typography>
                          </Stack>
                        }
                        sx={{
                          backgroundColor: 'rgba(228, 247, 243, 1)',
                          color: 'rgba(18, 112, 93, 1)',
                        }}
                      ></Chip>
                    )}

                    {isLoading ? (
                      <StyledSkeleton width="35px" height="16px" />
                    ) : (
                      <Chip
                        label={<Typography>+0,03 USD</Typography>}
                        sx={{
                          backgroundColor: 'rgba(228, 247, 243, 1)',
                          color: 'rgba(18, 112, 93, 1)',
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
                <Stack direction="column" spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ margin: '10px 0' }}>
                    {isLoading ? (
                      <StyledSkeleton width="32px" height="32px" />
                    ) : (
                      <Box
                        width="32px"
                        height="32px"
                        sx={{ backgroundColor: 'rgba(240, 243, 245, 1)', borderRadius: '8px' }}
                      ></Box>
                    )}
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography
                        variant="body-1-regular"
                        sx={{ fontWeight: 500, marginBottom: '20px' }}
                      >
                        {tokenInfo.overview.tokenName}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
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
                      <Typography variant="body-1-regular">
                        {tokenInfo.overview.description}
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="column" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
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

                  <Stack direction="column" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="84px" height="20px" />
                    ) : (
                      <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
                        Policy ID
                      </Typography>
                    )}

                    <Stack direction="row" spacing={2} alignItems="self-start">
                      {isLoading ? (
                        <Box flex={1}>
                          <StyledSkeleton height="20px" width="full" />
                          <StyledSkeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                        </Box>
                      ) : (
                        <Typography variant="body-1-regular" sx={{ wordBreak: 'break-word' }}>
                          {tokenInfo.overview.policyId}
                        </Typography>
                      )}
                      <CopyButton
                        disabled={isLoading}
                        textToCopy={`${tokenInfo.overview.policyId}`}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="column" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="84px" height="20px" />
                    ) : (
                      <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
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
                        <Typography variant="body-1-regular" sx={{ wordBreak: 'break-word' }}>
                          {tokenInfo.overview.fingerprint}
                        </Typography>
                      )}
                      <CopyButton
                        disabled={isLoading}
                        textToCopy={`${tokenInfo.overview.fingerprint}`}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="column" spacing={1}>
                    {isLoading ? (
                      <StyledSkeleton width="53px" height="16px" />
                    ) : (
                      <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
                        Details on
                      </Typography>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1}>
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
                <Typography variant="body-1-regular" sx={{ fontWeight: 500, marginBottom: '30px' }}>
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
                      <Typography variant="body-1-regular">{item.label}</Typography>
                      <InfoText>{tokenInfo.performance[index].value}</InfoText>
                    </Stack>
                  ))}
                </Stack>
              </TabContent>
            ) : null}
          </Box>
        </Card>
      </TokenInfo>

      <TransactionHistory mockHistory={mockHistory} />
    </Box>
  );
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

const InfoText = styled(Typography)({
  fontWeight: 400,
  fontSize: '1rem',
  color: 'rgba(0, 0, 0, 1)',
});

export default TokenDetailsPage;
