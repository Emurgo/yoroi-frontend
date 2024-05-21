import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { ReactComponent as ArrowLeft } from '../../assets/images/assets-page/back-arrow.inline.svg';
import { ReactComponent as ArrowDown } from '../../assets/images/portfolio/down-arrow.inline.svg';
import { ReactComponent as ArrowUp } from '../../assets/images/portfolio/up-arrow.inline.svg';
import { ReactComponent as ArrowUpHistory } from '../../assets/images/portfolio/transaction-history/up-arrow-history.inline.svg';
import { ReactComponent as ArrowDownHistory } from '../../assets/images/portfolio/transaction-history/down-arrow-history.inline.svg';
import { ReactComponent as ExpandArrow } from '../../assets/images/portfolio/transaction-history/expand-arrow.inline.svg';
import TokenDetailChart from './TokenDetailChart';
import { TxInputsBuilder } from '@emurgo/cardano-serialization-lib-browser';
import SubMenu from '../topbar/SubMenu';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { tableCellClasses } from '@mui/material/TableCell';
import { useHistory } from 'react-router-dom';

const mockHistoryToday = [
  {
    type: 'Sent',
    time: '11:30 PM',
    date: '05/21/2024',
    status: 'Low',
    fee: {
      amount: '0.17 ADA',
      usd: '0.03 USD',
    },
    amount: {
      total: '1,169,789.34432 ADA',
      usd: '0.03 USD',
      asset: '200 MILK',
    },
  },
  {
    type: 'Received',
    time: '9:12 PM',
    date: '05/21/2024',
    status: 'Low',
    amount: {
      total: '1,169,789.34432 ADA',
      usd: '312,323.33 USD',
      asset: 2,
    },
  },
];

const mockHistoryYesterday = [
  {
    type: 'Transaction error',
    time: '9:12 PM',
    date: '05/20/2024',
    status: 'Failed',
    amount: {
      total: '1,169,789.34432 ADA',
      usd: '312,323.33 USD',
      asset: 2,
    },
  },
];

const TokenDetailsPage = ({ tokenInfo, subMenuOptions, rows }) => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(subMenuOptions[0].route);

  const isActiveItem: string => boolean = route => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

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
        <Card sx={{ borderColor: 'grayscale.200', bgcolor: 'background.card' }}>
          <Box sx={{ padding: '20px' }}>
            <Title sx={{ marginBottom: '15px' }}>ADA balance</Title>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography sx={{ fontWeight: 500, fontSize: '1.75rem', lineHeight: '2rem' }}>
                200000,00
              </Typography>
              <Typography
                sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: '22px', marginTop: '5px' }}
              >
                ADA
              </Typography>
            </Stack>
            <SubTitle>680,00 USD</SubTitle>
          </Box>
          <Divider />
          <Box sx={{ padding: '20px' }}>
            <Stack direction="row" justifyContent="space-between">
              <Title>Market price</Title>
              <Stack direction="row" gap={2}>
                <Stack direction="row" alignItems="center">
                  <Typography sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: '24px' }}>
                    0,48
                  </Typography>
                  &nbsp;USD
                </Stack>
                <StyledChip
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
                  sx={{ backgroundColor: 'rgba(228, 247, 243, 1)', color: 'rgba(18, 112, 93, 1)' }}
                ></StyledChip>
                <StyledChip
                  label={<Typography>+0,03 USD</Typography>}
                  sx={{ backgroundColor: 'rgba(228, 247, 243, 1)', color: 'rgba(18, 112, 93, 1)' }}
                ></StyledChip>
              </Stack>
            </Stack>
            <TokenDetailChart />
          </Box>
        </Card>

        <Card sx={{ borderColor: 'grayscale.200', bgcolor: 'background.card' }}>
          <Box sx={{ marginTop: '20px' }}>
            <SubMenu
              options={subMenuOptions}
              onItemClick={route => setSelectedTab(route)}
              isActiveItem={isActiveItem}
              locationId="token-details"
            />
            <Divider sx={{ margin: '0 20px' }} />
          </Box>
          <Box sx={{ padding: '20px' }}>
            {selectedTab === subMenuOptions[0].route ? (
              <TabContent>
                <Title sx={{ marginBottom: '20px' }}>Market data</Title>
                <Stack direction="column" spacing={1.2}>
                  {tokenInfo.performance.map(item => (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                    >
                      <SubTitle>{item.label}</SubTitle>
                      <InfoText>{item.value}</InfoText>
                    </Stack>
                  ))}
                </Stack>
              </TabContent>
            ) : null}

            {selectedTab === subMenuOptions[1].route ? (
              <TabContent>
                <Title sx={{ marginBottom: '20px' }}>{tokenInfo.overview.tokenName}</Title>
                <Stack direction="column" spacing={1.5}>
                  <Stack direction="column" spacing={0.5}>
                    <Title>Description</Title>
                    <SubTitle>{tokenInfo.overview.description}</SubTitle>
                  </Stack>
                  <Stack direction="column" spacing={0.5}>
                    <Title>Website</Title>
                    <Link href={tokenInfo.overview.website}>{tokenInfo.overview.website}</Link>
                  </Stack>
                  <Stack direction="column" spacing={0.5}>
                    <Title>Details on</Title>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Link href={tokenInfo.overview.detailOn}>Cardanoscan</Link>
                      <Button variant="text" sx={{ maxHeight: '22px' }}>
                        Adaex
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </TabContent>
            ) : null}
          </Box>
        </Card>
      </TokenInfo>

      <TransactionHistory>
        <Card sx={{ borderColor: 'grayscale.200', bgcolor: 'background.card' }}>
          <Box sx={{ padding: '20px' }}>
            <Title>Transaction history</Title>
            <Table
              sx={{
                marginTop: '25px',
              }}
              aria-label="transaction history table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <SubTitle>Transaction type</SubTitle>
                  </TableCell>
                  <TableCell>
                    <SubTitle>Status</SubTitle>
                  </TableCell>
                  <TableCell align="center">
                    <SubTitle>Fee</SubTitle>
                  </TableCell>
                  <TableCell align="right">
                    <SubTitle>Amount</SubTitle>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <SubTitle sx={{ padding: '30px 20px 0' }}>Today</SubTitle>
                {mockHistoryToday.map(row => (
                  <TableRow sx={{ '& td, & th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                          sx={{
                            width: '48px',
                            height: '48px',
                            backgroundColor:
                              row.type === 'Sent'
                                ? 'rgba(228, 232, 247, 1)'
                                : row.type === 'Received'
                                ? 'rgba(228, 247, 243, 1)'
                                : 'rgba(255, 241, 245, 1)',
                          }}
                        >
                          {row.type === 'Sent' ? (
                            <ArrowUpHistory
                              stroke="rgba(75, 109, 222, 1)"
                              width="24px"
                              height="24px"
                            />
                          ) : row.type === 'Received' ? (
                            <ArrowUpHistory
                              stroke="rgba(8, 194, 157, 1)"
                              width="24px"
                              height="24px"
                              style={{ transform: 'rotate(180deg)' }}
                            />
                          ) : (
                            <ArrowUpHistory
                              stroke="rgba(255, 19, 81, 1)"
                              width="24px"
                              height="24px"
                            />
                          )}
                        </IconButton>
                        <Stack direction="column">
                          <Typography
                            sx={{ fontWeight: 400, fontSize: '1rem', color: 'rgba(36, 40, 56, 1)' }}
                          >
                            {row.type}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: '0.75rem',
                              letterSpacing: '0.2px',
                              color: 'rgba(107, 115, 132, 1)',
                            }}
                          >
                            {row.time}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontSize: '1rem',
                          color: row.status === 'Failed' ? 'red' : 'rgba(36, 40, 56, 1)',
                        }}
                      >
                        {row.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="column">
                        <Title>{row.fee ? row.fee.amount : '-'}</Title>
                        <SubTitle>{row.fee ? row.fee.usd : '-'}</SubTitle>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ float: 'right' }}>
                        <Stack direction="column">
                          <Title sx={{ textAlign: 'right' }}>
                            {row.type === 'Received' && '+'}
                            {row.amount.total}
                          </Title>
                          <SubTitle sx={{ textAlign: 'right' }}>
                            {row.type === 'Received' && '+'}
                            {row.amount.usd}
                          </SubTitle>
                          {row.type === 'Received' ? (
                            <Title sx={{ textAlign: 'right' }}>+ {row.amount.asset} assets</Title>
                          ) : (
                            <Title sx={{ textAlign: 'right' }}>{row.amount.asset}</Title>
                          )}
                        </Stack>
                        <ExpandArrow width="16px" height="16px" />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                <SubTitle sx={{ padding: '30px 20px 0' }}>Yesterday</SubTitle>
                {mockHistoryYesterday.map(row => (
                  <TableRow sx={{ '& td, & th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                          sx={{
                            width: '48px',
                            height: '48px',
                            backgroundColor:
                              row.type === 'Sent'
                                ? 'rgba(228, 232, 247, 1)'
                                : row.type === 'Received'
                                ? 'rgba(228, 247, 243, 1)'
                                : 'rgba(255, 241, 245, 1)',
                          }}
                        >
                          {row.type === 'Sent' ? (
                            <ArrowUpHistory
                              stroke="rgba(75, 109, 222, 1)"
                              width="24px"
                              height="24px"
                            />
                          ) : row.type === 'Received' ? (
                            <ArrowUpHistory
                              stroke="rgba(8, 194, 157, 1)"
                              width="24px"
                              height="24px"
                              style={{ transform: 'rotate(180deg)' }}
                            />
                          ) : (
                            <ArrowUpHistory
                              stroke="rgba(255, 19, 81, 1)"
                              width="24px"
                              height="24px"
                            />
                          )}
                        </IconButton>
                        <Stack direction="column">
                          <Typography
                            sx={{ fontWeight: 400, fontSize: '1rem', color: 'rgba(36, 40, 56, 1)' }}
                          >
                            {row.type}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: '0.75rem',
                              letterSpacing: '0.2px',
                              color: 'rgba(107, 115, 132, 1)',
                            }}
                          >
                            {row.time}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          fontSize: '1rem',
                          color: row.status === 'Failed' ? 'red' : 'rgba(36, 40, 56, 1)',
                        }}
                      >
                        {row.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="column">
                        <Title>{row.fee ? row.fee.amount : '-'}</Title>
                        <SubTitle>{row.fee ? row.fee.usd : '-'}</SubTitle>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ float: 'right' }}>
                        <Stack direction="column">
                          <Title sx={{ textAlign: 'right' }}>
                            {row.type === 'Received' && '+'}
                            {row.amount.total}
                          </Title>
                          <SubTitle sx={{ textAlign: 'right' }}>
                            {row.type === 'Received' && '+'}
                            {row.amount.usd}
                          </SubTitle>
                          {row.type === 'Received' ? (
                            <Title sx={{ textAlign: 'right' }}>+ {row.amount.asset} assets</Title>
                          ) : (
                            <Title sx={{ textAlign: 'right' }}>{row.amount.asset}</Title>
                          )}
                        </Stack>
                        <ExpandArrow width="16px" height="16px" />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </TransactionHistory>
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

const TransactionHistory = styled(Box)({
  width: '100%',
  margin: '30px 0 100px',
});

const Card = styled(Box)({
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
});

const StyledButton = styled(Button)({
  maxHeight: '40px',
});

const Title = styled(Typography)({
  fontWeight: 500,
  fontSize: '1rem',
});

const SubTitle = styled(Typography)({
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: '1.5rem',
  color: 'rgba(107, 115, 132, 1)',
});

const StyledChip = styled(Chip)({
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: '1rem',
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
