import React, { Fragment, useMemo, useState } from 'react';
import { Box, Stack, Typography, IconButton, Table, TableCell, TableHead, TableBody, TableRow, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Card } from '../../../../components';
import moment from 'moment';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';
import { HistoryItemStatus, HistoryItemType, TransactionItemType } from '../../common/types/transaction';
import { mapStrings } from '../../common/helpers/transactionHelper';
import { IHeadCell } from '../../common/types/table';
import _ from 'lodash';
import mockData from '../../common/mockData';
import { formatNumber } from '../../common/helpers/formatHelper';

const Container = styled(Box)(() => ({
  width: '100%',
  margin: '30px 0',
}));

const TransactionTable = ({ history, tokenName }: { history: TransactionItemType[]; tokenName: string }): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();

  const headCells: IHeadCell[] = [
    { id: 'transactionType', label: strings.transactionType, align: 'left' },
    { id: 'status', label: strings.status, align: 'left' },
    { id: 'fee', label: strings.fee, align: 'center' },
    { id: 'amount', label: strings.amount, align: 'right' },
  ];

  const groupedData = useMemo(() => {
    if (!history) return [];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return _.chain(mapStrings(history, strings))
      .groupBy(t => {
        const time = new Date(t.time);
        time.setHours(0, 0, 0, 0);
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
  }, [mockData.transactionHistory]);

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
                {headCells.map(({ id, align, label }, index) => (
                  <TableCell key={id} align={align} sx={{ paddingX: index ? theme.spacing(2) : '0' }}>
                    <Typography variant="body2" color="ds.gray_c600">
                      {label}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell key={'expand'} sx={{ width: '2.5rem' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupedData.map(item => (
                <Fragment key={item.title}>
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
                      tokenName={tokenName}
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

const TransactionHistoryItem = ({ index, row, theme, strings, unitOfAccount, headCells, tokenName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TableRow key={`${row.label} ${index}`} sx={{ '& td, & th': { border: 0 } }}>
      <TableCell key={`${row.label} ${headCells[0].id}`} sx={{ paddingX: 0 }}>
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
            {row.type === HistoryItemType.SENT && <Icon.Send stroke={theme.palette.ds.primary_c500} />}
            {row.type === HistoryItemType.RECEIVED && (
              <Icon.Send stroke={theme.palette.ds.secondary_c600} style={{ transform: 'rotate(180deg)' }} />
            )}
            {row.type === HistoryItemType.ERROR && <Icon.Cancel fill={theme.palette.ds.sys_magenta_c500} />}
            {row.type === HistoryItemType.WITHDRAW && <Icon.Staking fill={theme.palette.ds.secondary_c600} />}
            {row.type === HistoryItemType.DELEGATE && <Icon.Staking fill={theme.palette.ds.primary_c500} />}
          </IconButton>
          <Stack direction="column">
            <Typography color="ds.gray_c900">{row.label}</Typography>
            {isExpanded && (
              <Typography sx={{ fontSize: '0.75rem' }} color="ds.gray_c600">
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
          <Typography fontWeight="500" color="ds.text_gray_medium">
            {row.feeValue ? `${row.feeValue.toFixed(2)} ADA` : '-'}
          </Typography>
          {isExpanded &&
            (unitOfAccount === 'ADA' ? null : (
              <Typography variant="body2" color="ds.text_gray_low">
                {row.feeValueUsd ? `${row.feeValueUsd.toFixed(2)} ${unitOfAccount}` : '-'}
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
              {formatNumber(row.amountTotal)} {tokenName}
            </Typography>
            {isExpanded ? (
              <Box sx={{ transition: 'all ease 0.3s' }}>
                {unitOfAccount === 'ADA' ? null : (
                  <Typography variant="body2" color="ds.gray_c600" sx={{ textAlign: 'right' }}>
                    {(row.type === HistoryItemType.RECEIVED ||
                      row.type === HistoryItemType.WITHDRAW ||
                      row.type === HistoryItemType.DELEGATE) &&
                      '+ '}
                    {formatNumber(row.amountTotalUsd)} {unitOfAccount}
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
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          paddingLeft: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Icon.Expand
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginTop: isExpanded ? 0 : theme.spacing(1),
            cursor: 'pointer',
            transition: 'all ease 0.3s',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-180deg)',
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default TransactionTable;
