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
import { useTheme } from '@mui/material/styles';
import { Card } from '../../../components';
import { default as ArrowIcon } from '../../../components/icons/portfolio/transaction-history/Arrow';
import { default as ExpandIcon } from '../../../components/icons/portfolio/transaction-history/Expand';
import { default as ErrorIcon } from '../../../components/icons/portfolio/transaction-history/Error';

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

const TransactionHistory = ({ history }) => {
  const theme = useTheme();

  const categorizedData = useMemo(() => categorizeByDate(history), [history]);
  return (
    <Container>
      <Card>
        <Box sx={{ padding: '20px' }}>
          <Typography fontWeight="500">Transaction history</Typography>
          <Table
            sx={{
              marginTop: '25px',
            }}
            aria-label="transaction history table"
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                    Transaction type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>Status</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>Fee</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>Amount</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timestamps.map((timestamp, index) => (
                <>
                  <Typography
                    sx={{
                      color: theme.palette.ds.text_gray_medium,
                      marginTop: index ? '10px' : '20px',
                    }}
                  >
                    {timestamp}
                  </Typography>
                  {categorizedData[timestamp].map((row, index) => (
                    <TableRow key={index} sx={{ '& td, & th': { border: 0 } }}>
                      <TableCell key={index}>
                        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
                          <IconButton
                            sx={{
                              width: '48px',
                              height: '48px',
                              backgroundColor:
                                row.type === 'Sent'
                                  ? theme.palette.ds.sys_cyan_c100
                                  : row.type === 'Received'
                                  ? theme.palette.ds.secondary_c100
                                  : theme.palette.ds.sys_magenta_c100,
                            }}
                          >
                            {row.type === 'Sent' && (
                              <ArrowIcon
                                stroke={theme.palette.ds.sys_cyan_c500}
                                width="24px"
                                height="24px"
                              />
                            )}
                            {row.type === 'Received' && (
                              <ArrowIcon
                                stroke={theme.palette.ds.secondary_c500}
                                width="24px"
                                height="24px"
                                style={{ transform: 'rotate(180deg)' }}
                              />
                            )}
                            {row.type === 'Transaction error' && (
                              <ErrorIcon
                                fill={theme.palette.ds.sys_magenta_c500}
                                width="24px"
                                height="24px"
                              />
                            )}
                          </IconButton>
                          <Stack direction="column">
                            <Typography>{row.type}</Typography>
                            <Typography
                              variant="caption1"
                              sx={{ color: theme.palette.ds.text_gray_medium }}
                            >
                              {row.time}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color:
                              row.status === 'Failed'
                                ? theme.palette.ds.sys_magenta_c500
                                : theme.palette.ds.black_static,
                          }}
                        >
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="column">
                          <Typography fontWeight="500">{row.fee ? row.fee.amount : '-'}</Typography>
                          <Typography>{row.fee ? row.fee.usd : '-'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
                          <Stack direction="column">
                            <Typography fontWeight="500" sx={{ textAlign: 'right' }}>
                              {row.type === 'Received' && '+'}
                              {row.amount.total}
                            </Typography>
                            <Typography sx={{ textAlign: 'right' }}>
                              {row.type === 'Received' && '+'}
                              {row.amount.usd}
                            </Typography>
                            {row.type === 'Received' && (
                              <Typography fontWeight="500" sx={{ textAlign: 'right' }}>
                                + {row.amount.asset} assets
                              </Typography>
                            )}
                            {row.type === 'Sent' && (
                              <Typography weight="500" sx={{ textAlign: 'right' }}>
                                {row.amount.asset}
                              </Typography>
                            )}
                          </Stack>
                          <ExpandIcon width="16px" height="16px" />
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
