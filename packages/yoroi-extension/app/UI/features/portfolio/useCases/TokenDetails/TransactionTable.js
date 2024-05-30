import React, { useMemo, useState } from 'react';
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
import { Card } from '../../../../components';
import ArrowIcon from '../../common/assets/icons/transaction-history/Arrow';
import ExpandIcon from '../../common/assets/icons/transaction-history/Expand';
import ErrorIcon from '../../common/assets/icons/transaction-history/Error';
import WithdrawIcon from '../../common/assets/icons/transaction-history/Withdraw';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import moment from 'moment';

export const HistoryItemType = Object.freeze({
  SENT: 1,
  RECEIVED: 2,
  ERROR: 3,
  WITHDRAW: 4,
  DELEGATE: 5,
});

export const HistoryItemStatus = Object.freeze({
  LOW: 'Low',
  HIGH: 'High',
  FAILED: 'Failed',
});

const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '30px 0 100px',
}));

const TransactionTable = ({ history }) => {
  const theme = useTheme();
  const { strings } = usePortfolio();

  const mapStrings = arr =>
    arr.map(item => {
      let labelTemp = '';
      let statusTemp = '';

      switch (item.type) {
        case HistoryItemType.SENT:
          labelTemp = strings.sent;
          break;
        case HistoryItemType.RECEIVED:
          labelTemp = strings.received;
          break;
        case HistoryItemType.ERROR:
          labelTemp = strings.transactionError;
          break;
        case HistoryItemType.WITHDRAW:
          labelTemp = strings.rewardWithdraw;
          break;
        case HistoryItemType.DELEGATE:
          labelTemp = strings.stakeDelegate;
          break;

        default:
          break;
      }

      switch (item.status) {
        case HistoryItemStatus.LOW:
          statusTemp = strings.low;
          break;
        case HistoryItemStatus.HIGH:
          statusTemp = strings.high;
          break;
        case HistoryItemStatus.FAILED:
          statusTemp = strings.failed;
          break;
        default:
          break;
      }

      return {
        ...item,
        label: labelTemp,
        status: statusTemp,
      };
    });

  const groupedData = useMemo(() => {
    if (!history) return [];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return _.chain(mapStrings(history))
      .groupBy(t => {
        const time = new Date(t.time);
        time.setHours(0, 0, 0, 0); // set the time to 00:00:00 for grouping by day
        return time.toISOString();
      })
      .map((data, title) => ({
        title:
          new Date(title).getDate() === today.getDate()
            ? strings.today
            : new Date(title).getDate() === yesterday.getDate()
            ? strings.yesterday
            : moment(title).format('MMMM DD, YYYY'),
        data,
      }))
      .value();
  }, [history]);

  return (
    <Container>
      <Card>
        <Box sx={{ padding: theme.spacing(3) }}>
          <Typography fontWeight="500" sx={{ color: theme.palette.ds.black_static }}>
            {strings.transactionHistory}
          </Typography>
          <Table
            sx={{
              marginTop: theme.spacing(3),
            }}
            aria-label="transaction history table"
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {strings.transactionType}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {strings.status}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {strings.fee}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {strings.amount}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedData.map((item, index) => (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.ds.text_gray_medium,
                      marginTop: theme.spacing(3),
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.data.map((row, index) => (
                    <TransactionHistoryItem
                      index={index}
                      row={row}
                      theme={theme}
                      strings={strings}
                    />
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

const TransactionHistoryItem = ({ index, row, theme, strings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TableRow key={index} sx={{ '& td, & th': { border: 0 } }}>
      <TableCell key={index}>
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          <IconButton
            sx={{
              width: '48px',
              height: '48px',
              backgroundColor:
                row.type === HistoryItemType.SENT || row.type === HistoryItemType.DELEGATE
                  ? theme.palette.ds.primary_c100
                  : row.type === HistoryItemType.RECEIVED || row.type === HistoryItemType.WITHDRAW
                  ? theme.palette.ds.secondary_c100
                  : theme.palette.ds.sys_magenta_c100,
              '&:hover': {
                backgroundColor:
                  row.type === HistoryItemType.SENT || row.type === HistoryItemType.DELEGATE
                    ? theme.palette.ds.primary_c100
                    : row.type === HistoryItemType.RECEIVED || row.type === HistoryItemType.WITHDRAW
                    ? theme.palette.ds.secondary_c100
                    : theme.palette.ds.sys_magenta_c100,
              },
            }}
          >
            {row.type === HistoryItemType.SENT && (
              <ArrowIcon stroke={theme.palette.ds.text_primary_medium} width="24px" height="24px" />
            )}
            {row.type === HistoryItemType.RECEIVED && (
              <ArrowIcon
                stroke={theme.palette.ds.text_success}
                width="24px"
                height="24px"
                style={{ transform: 'rotate(180deg)' }}
              />
            )}
            {row.type === HistoryItemType.ERROR && (
              <ErrorIcon fill={theme.palette.ds.text_error} width="24px" height="24px" />
            )}
            {row.type === HistoryItemType.WITHDRAW && (
              <WithdrawIcon fill={theme.palette.ds.text_success} width="24px" height="24px" />
            )}
            {row.type === HistoryItemType.DELEGATE && (
              <WithdrawIcon
                fill={theme.palette.ds.text_primary_medium}
                width="24px"
                height="24px"
              />
            )}
          </IconButton>
          <Stack direction="column">
            <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>{row.label}</Typography>
            <Typography variant="caption1" sx={{ color: theme.palette.ds.text_gray_medium }}>
              {moment.utc(row.time).local().format('h:mm A')}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography
          sx={{
            color:
              row.status === HistoryItemStatus.FAILED
                ? theme.palette.ds.text_error
                : theme.palette.ds.text_gray_normal,
          }}
        >
          {row.status}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Stack direction="column">
          <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
            {row.feeValue ? `${row.feeValue} ADA` : '-'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
            {row.feeValueUsd ? `${row.feeValueUsd} USD` : '-'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={theme.spacing(2)} sx={{ float: 'right' }}>
          <Stack direction="column">
            <Typography
              fontWeight="500"
              sx={{ textAlign: 'right', color: theme.palette.ds.text_gray_normal }}
            >
              {(row.type === HistoryItemType.RECEIVED ||
                row.type === HistoryItemType.WITHDRAW ||
                row.type === HistoryItemType.DELEGATE) &&
                '+ '}
              {row.amountTotal} ADA
            </Typography>
            {isExpanded ? (
              <Box sx={{ transition: 'all ease 0.3s' }}>
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'right', color: theme.palette.ds.text_gray_medium }}
                >
                  {(row.type === HistoryItemType.RECEIVED ||
                    row.type === HistoryItemType.WITHDRAW ||
                    row.type === HistoryItemType.DELEGATE) &&
                    '+ '}
                  {row.amountTotalUsd} USD
                </Typography>
                {row.type === HistoryItemType.RECEIVED && (
                  <Typography variant="body2" fontWeight="500" sx={{ textAlign: 'right' }}>
                    + {row.amountAsset} {strings.assets}
                  </Typography>
                )}
                {row.type === HistoryItemType.SENT && (
                  <Typography variant="body2" fontWeight="500" sx={{ textAlign: 'right' }}>
                    {row.amountAsset}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Stack>
          <ExpandIcon
            style={{
              cursor: 'pointer',
              transition: 'all ease 0.3s',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(90deg)',
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTable;
