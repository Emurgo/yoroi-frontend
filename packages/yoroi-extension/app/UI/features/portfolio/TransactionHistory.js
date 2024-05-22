import React, { useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  styled,
} from '@mui/material';
import { Card } from '../../components';
import { ReactComponent as ArrowIcon } from './images/transaction-history/arrow-icon.inline.svg';
import { ReactComponent as ExpandArrow } from './images/transaction-history/expand-arrow.inline.svg';
import { ReactComponent as ErrorIcon } from './images/transaction-history/error-icon.inline.svg';
import { ReactComponent as WithdrawIcon } from './images/transaction-history/withdraw-icon.inline.svg';

const timestamps = ['Today', 'Yesterday', 'In the past'];
const categorizeByDate = data => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return data.reduce(
    (acc, item) => {
      const itemDate = new Date(item.date);
      if (itemDate.toDateString() === today.toDateString()) {
        acc['Today'].push(item);
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        acc['Yesterday'].push(item);
      } else {
        acc['In the past'].push(item);
      }
      return acc;
    },
    {
      Today: [],
      Yesterday: [],
      'In the past': [],
    }
  );
};

const TransactionHistory = ({ mockHistory }) => {
  const categorizedData = useMemo(() => categorizeByDate(mockHistory), [mockHistory]);
  return (
    <Container>
      <Card>
        <Box sx={{ padding: '20px' }}>
          <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
            Transaction history
          </Typography>
          <Table
            sx={{
              marginTop: '25px',
            }}
            aria-label="transaction history table"
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body-1-regular">Transaction type</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body-1-regular">Status</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body-1-regular">Fee</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body-1-regular">Amount</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timestamps.map((timestamp, index) => (
                <>
                  <Typography variant="body-1-regular">{timestamp}</Typography>
                  {categorizedData[timestamp].map((row, index) => (
                    <TableRow sx={{ '& td, & th': { border: 0 } }}>
                      <TableCell key={index}>
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
                            {row.type === 'Sent' && (
                              <ArrowIcon
                                stroke="rgba(75, 109, 222, 1)"
                                width="24px"
                                height="24px"
                              />
                            )}
                            {row.type === 'Received' && (
                              <ArrowIcon
                                stroke="rgba(8, 194, 157, 1)"
                                width="24px"
                                height="24px"
                                style={{ transform: 'rotate(180deg)' }}
                              />
                            )}
                            {row.type === 'Transaction error' && (
                              <ErrorIcon stroke="rgba(255, 19, 81, 1)" width="24px" height="24px" />
                            )}
                          </IconButton>
                          <Stack direction="column">
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: '1rem',
                                color: 'rgba(36, 40, 56, 1)',
                              }}
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
                          <Typography variant="body-1-regular" sx={{ fontWeight: 500 }}>
                            {row.fee ? row.fee.amount : '-'}
                          </Typography>
                          <Typography variant="body-1-regular">
                            {row.fee ? row.fee.usd : '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ float: 'right' }}>
                          <Stack direction="column">
                            <Typography
                              variant="body-1-regular"
                              sx={{ textAlign: 'right', fontWeight: 500 }}
                            >
                              {row.type === 'Received' && '+'}
                              {row.amount.total}
                            </Typography>
                            <Typography sx={{ textAlign: 'right' }}>
                              {row.type === 'Received' && '+'}
                              {row.amount.usd}
                            </Typography>
                            {row.type === 'Received' && (
                              <Typography
                                variant="body-1-regular"
                                sx={{ textAlign: 'right', fontWeight: 500 }}
                              >
                                + {row.amount.asset} assets
                              </Typography>
                            )}
                            {row.type === 'Sent' && (
                              <Typography
                                variant="body-1-regular"
                                weight="500"
                                sx={{ textAlign: 'right' }}
                              >
                                {row.amount.asset}
                              </Typography>
                            )}
                          </Stack>
                          <ExpandArrow width="16px" height="16px" />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Container>
  );
};

const Container = styled(Box)({
  width: '100%',
  margin: '30px 0 100px',
});

export default TransactionHistory;
