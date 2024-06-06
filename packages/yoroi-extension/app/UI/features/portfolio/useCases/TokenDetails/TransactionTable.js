// @flow
import React, { Fragment, useMemo, useState } from 'react';
import { Box, Stack, Typography, IconButton, Table, TableCell, TableHead, TableBody, TableRow, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card } from '../../../../components';
import moment from 'moment';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';

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
  margin: '30px 0',
}));

const TransactionTable = ({ history }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();

  const headCells = [
    { id: 'transactionType', label: strings.transactionType, align: 'left' },
    { id: 'status', label: strings.status, align: 'left' },
    { id: 'fee', label: strings.fee, align: 'center' },
    { id: 'amount', label: strings.amount, align: 'right' },
  ];

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
        data: _.chain(data)
          .sortBy(item => new Date(item.time).getTime())
          .reverse()
          .value(),
      }))
      .sortBy(group => new Date(group.data[0].time).getTime())
      .reverse()
      .value();
  }, [history]);

  return (
    <Container>
      <Card>
        <Box sx={{ padding: theme.spacing(3) }}>
          <Typography fontWeight="500" color="ds.gray_cmax">
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
                {headCells.map(({ id, align, label }) => (
                  <TableCell key={id} align={align}>
                    <Typography variant="body2" color="ds.gray_c600">
                      {label}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedData.map((item, index) => (
                <Fragment key={index}>
                  <Box
                    component="tr"
                    key={item.title}
                    display="block"
                    sx={{
                      marginTop: theme.spacing(3),
                    }}
                  >
                    <Typography key={item.title} component="th" variant="body2" color="ds.gray_c600">
                      {item.title}
                    </Typography>
                  </Box>
                  {item.data.map((row, index) => (
                    <TransactionHistoryItem
                      index={index}
                      row={row}
                      theme={theme}
                      strings={strings}
                      unitOfAccount={unitOfAccount}
                      headCells={headCells}
                    />
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Container>
  );
};

const TransactionHistoryItem = ({ index, row, theme, strings, unitOfAccount, headCells }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TableRow key={`${row.label} ${index}`} sx={{ '& td, & th': { border: 0 } }}>
      <TableCell key={`${row.label} ${headCells[0].id}`}>
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          <IconButton
            disableRipple={true}
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
            {row.type === HistoryItemType.SENT && <Icon.Send stroke={theme.palette.ds.primary_c600} />}
            {row.type === HistoryItemType.RECEIVED && (
              <Icon.Send stroke={theme.palette.ds.secondary_c400} style={{ transform: 'rotate(180deg)' }} />
            )}
            {row.type === HistoryItemType.ERROR && <Icon.Cancel fill={theme.palette.ds.sys_magenta_c500} />}
            {row.type === HistoryItemType.WITHDRAW && <Icon.Staking fill={theme.palette.ds.secondary_c400} />}
            {row.type === HistoryItemType.DELEGATE && <Icon.Staking fill={theme.palette.ds.primary_c600} />}
          </IconButton>
          <Stack direction="column">
            <Typography color="ds.gray_c900">{row.label}</Typography>
            {isExpanded && (
              <Typography variant="caption1" color="ds.gray_c600">
                {moment.utc(row.time).local().format('h:mm A')}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>
      <TableCell key={`${row.label} ${headCells[1].id}`}>
        <Typography color={row.status === HistoryItemStatus.FAILED ? 'ds.sys_magenta_c500' : 'ds.gray_c900'}>
          {row.status}
        </Typography>
      </TableCell>
      <TableCell key={`${row.label} ${headCells[2].id}`} align="center">
        <Stack direction="column">
          <Typography fontWeight="500" color="ds.text_gray_normal">
            {row.feeValue ? `${row.feeValue} ADA` : '-'}
          </Typography>
          {isExpanded &&
            (unitOfAccount === 'ADA' ? null : (
              <Typography variant="body2" color="ds.text_gray_medium">
                {row.feeValueUsd ? `${row.feeValueUsd} ${unitOfAccount}` : '-'}
              </Typography>
            ))}
        </Stack>
      </TableCell>
      <TableCell key={`${row.label} ${headCells[3].id}`}>
        <Stack
          direction="row"
          spacing={theme.spacing(2)}
          sx={{
            float: 'right',
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Stack direction="column">
            <Typography fontWeight="500" color="ds.gray_c900" sx={{ textAlign: 'right' }}>
              {(row.type === HistoryItemType.RECEIVED ||
                row.type === HistoryItemType.WITHDRAW ||
                row.type === HistoryItemType.DELEGATE) &&
                '+ '}
              {row.amountTotal} ADA
            </Typography>
            {isExpanded ? (
              <Box sx={{ transition: 'all ease 0.3s' }}>
                {unitOfAccount === 'ADA' ? null : (
                  <Typography variant="body2" color="ds.gray_c600" sx={{ textAlign: 'right' }}>
                    {(row.type === HistoryItemType.RECEIVED ||
                      row.type === HistoryItemType.WITHDRAW ||
                      row.type === HistoryItemType.DELEGATE) &&
                      '+ '}
                    {row.amountTotalUsd} {unitOfAccount}
                  </Typography>
                )}
                {row.type === HistoryItemType.RECEIVED && (
                  <Typography variant="body2" fontWeight="500" color="ds.gray_cmax" sx={{ textAlign: 'right' }}>
                    + {row.amountAsset} {strings.assets}
                  </Typography>
                )}
                {row.type === HistoryItemType.SENT && (
                  <Typography variant="body2" fontWeight="500" color="ds.gray_cmax" sx={{ textAlign: 'right' }}>
                    {row.amountAsset}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Stack>
          <Icon.Expand
            style={{
              transition: 'all ease 0.3s',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-180deg)',
            }}
          />
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTable;
