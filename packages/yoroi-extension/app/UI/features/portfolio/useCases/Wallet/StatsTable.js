import React, { useCallback, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import tokenPng from '../../common/assets/images/token.png';
import { useNavigateTo } from '../../common/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Chip } from '../../../../components/chip';
import { Skeleton } from '../../../../components/Skeleton';
import { useStrings } from '../../common/useStrings';
import { Icon } from '../../../../components/icons/index';
import illustrationPng from '../../common/assets/images/illustration.png';

const TableRowSkeleton = ({ id, theme }) => (
  <TableRow
    key={id}
    sx={{
      '& td': { border: 0 },
    }}
  >
    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
        <Skeleton width="40px" height="40px" />
        <Stack direction="column" spacing={theme.spacing(0.25)}>
          <Skeleton width="55px" height="24px" />
          <Skeleton width="55px" height="16px" />
        </Stack>
      </Stack>
    </TableCell>

    <TableCell>
      <Skeleton width="126px" height="24px" />
    </TableCell>

    <TableCell>
      <Skeleton width="62px" height="20px" />
    </TableCell>

    <TableCell>
      <Skeleton width="62px" height="20px" />
    </TableCell>

    <TableCell>
      <Skeleton width="62px" height="20px" />
    </TableCell>

    <TableCell>
      <Skeleton width="146px" height="24px" />
    </TableCell>

    <TableCell>
      <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
        <Stack direction="column" spacing={theme.spacing(0.25)}>
          <Skeleton width="146px" height="24px" />
          <Skeleton width="146px" height="16px" />
        </Stack>
      </Stack>
    </TableCell>
  </TableRow>
);

const StatsTable = ({ data, isLoading }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState({
    order: null,
    orderBy: null,
  });
  const list = useMemo(() => [...data], [data]);

  const headCells = [
    { id: 'name', label: strings.name, align: 'left', sortType: 'character' },
    { id: 'price', label: strings.price, align: 'left', sortType: 'numeric' },
    { id: '24h', label: strings['24H'], align: 'left', sortType: 'numeric' },
    { id: '1W', label: strings['1W'], align: 'left', sortType: 'numeric' },
    { id: '1M', label: strings['1M'], align: 'left', sortType: 'numeric' },
    {
      id: 'portfolioPercents',
      label: `${strings.portfolio} %`,
      align: 'left',
      sortType: 'numeric',
    },
    {
      id: 'totalAmount',
      label: strings.totalAmount,
      align: 'right',
      sortType: 'numeric',
    },
  ];

  const handleRequestSort = property => {
    let direction = 'asc';
    if (order === 'asc') {
      if (property === orderBy) {
        direction = 'desc';
      }
    } else if (order === 'desc') {
      if (property === orderBy) {
        direction = null;
      }
    }
    setSortState({
      order: direction,
      orderBy: property,
    });
  };

  const descendingComparator = (a, b, sortType) => {
    switch (sortType) {
      case 'numeric':
        if (parseFloat(b[orderBy]) < parseFloat(a[orderBy])) {
          return -1;
        } else {
          return 1;
        }
      case 'character':
        return String(a[orderBy]).localeCompare(b[orderBy]);
      default:
        if (b[orderBy] < a[orderBy]) {
          return -1;
        } else {
          return 1;
        }
    }
  };

  const getSortedData = useCallback(
    arr => {
      if (!orderBy || !order) return data;
      const sortColumn = headCells.find(cell => cell.id === orderBy);
      const sortType = sortColumn?.sortType ?? 'character';
      return arr.sort((a, b) => {
        return order === 'desc' ? descendingComparator(a, b, sortType) : -descendingComparator(a, b, sortType);
      });
    },
    [order, orderBy, headCells]
  );

  return getSortedData(list).length > 0 ? (
    <Table aria-label="stats table">
      <TableHead>
        <TableRow>
          {headCells.map(({ label, align, id }) => (
            <TableCell key={id} align={align} sx={{ padding: `12.5px ${theme.spacing(2)}` }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                onClick={() => handleRequestSort(id)}
                sx={{ float: align, cursor: 'pointer' }}
              >
                <Typography variant="body2" color="ds.gray_c600" sx={{ userSelect: 'none' }}>
                  {label}
                </Typography>
                <Icon.Sort id={id} order={order} orderBy={orderBy} />
              </Stack>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading
          ? Array.from({ length: 6 }).map((item, index) => <TableRowSkeleton id={index} theme={theme} />)
          : getSortedData(list).map(row => (
              <TableRow
                key={row.id}
                onClick={() => navigateTo.portfolioDetail(row.id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: `${theme.shape.borderRadius}px`,
                  '& td': { border: 0 },
                  '&:hover': {
                    backgroundColor: theme.palette.ds.gray_c50,
                  },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
                    <Box
                      width="40px"
                      height="40px"
                      sx={{
                        borderRadius: `${theme.shape.borderRadius}px`,
                      }}
                      component="img"
                      src={tokenPng}
                    ></Box>
                    <Stack direction="column">
                      <Typography fontWeight="500" color="ds.text_gray_normal">
                        {row.name}
                      </Typography>
                      <Typography variant="body2" color="ds.text_gray_medium">
                        {row.id}
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="ds.text_gray_medium">
                    {row.price} USD
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    active={row['24h'] >= 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {row['24h'] >= 0 ? (
                          <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                        ) : (
                          <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                        )}

                        <Typography variant="caption1">{row['24h'] >= 0 ? row['24h'] : -1 * row['24h']}%</Typography>
                      </Stack>
                    }
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    active={row['1W'] >= 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {row['1W'] >= 0 ? (
                          <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                        ) : (
                          <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                        )}
                        <Typography variant="caption1">{row['1W'] >= 0 ? row['1W'] : -1 * row['1W']}%</Typography>
                      </Stack>
                    }
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    active={row['1M'] >= 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {row['1M'] >= 0 ? (
                          <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                        ) : (
                          <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                        )}
                        <Typography variant="caption1">{row['1M'] >= 0 ? row['1M'] : -1 * row['1M']}%</Typography>
                      </Stack>
                    }
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="ds.text_gray_medium">
                    {row.portfolioPercents.toFixed(2)}&nbsp;%
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
                    <Stack direction="column">
                      <Typography fontWeight="500" color="ds.text_gray_normal">
                        {row.totalAmount} {row.name}
                      </Typography>
                      {row.name === 'ADA' && unitOfAccount === 'ADA' ? null : (
                        <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
                          {row.totalAmountUsd} {unitOfAccount}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  ) : (
    <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
        <Box component="img" src={illustrationPng}></Box>
        <Typography variant="h4" fontWeight="500" color="ds.black_static">
          {strings.noResultsForThisSearch}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default StatsTable;
