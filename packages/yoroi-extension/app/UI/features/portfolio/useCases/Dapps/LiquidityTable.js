import React, { useCallback, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigateTo } from '../../common/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import adaPng from '../../../../../assets/images/ada.png';
import hoskyPng from '../../common/assets/images/hosky-token.png';
import minswapPng from '../../common/assets/images/minswap-dex.png';
import { Chip } from '../../../../components/chip';
import { Skeleton } from '../../../../components/Skeleton';
import { useStrings } from '../../common/useStrings';
import illustrationPng from '../../common/assets/images/illustration.png';
import { Icon } from '../../../../components/icons/';

const TableRowSkeleton = ({ id, theme }) => (
  <TableRow
    key={id}
    sx={{
      '& td': { border: 0 },
    }}
  >
    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Stack direction="row" alignItems="center" sx={{ position: 'relative', width: '46px' }}>
          <Skeleton width="24px" height="24px" />
          <Skeleton width="24px" height="24px" sx={{ position: 'absolute', top: 0, left: '22px' }} />
        </Stack>
        <Skeleton width="146px" height="24px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Skeleton width="32px" height="32px" />
        <Skeleton width="126px" height="24px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Stack direction="column" spacing={theme.spacing(0.25)}>
        <Skeleton width="146px" height="24px" />
        <Skeleton width="146px" height="16px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Stack direction="column" spacing={theme.spacing(0.25)}>
        <Skeleton width="146px" height="24px" />
        <Skeleton width="146px" height="16px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Skeleton width="146px" height="24px" />
    </TableCell>

    <TableCell>
      <Stack direction="column" spacing={theme.spacing(0.25)} sx={{ float: 'right' }}>
        <Skeleton width="146px" height="24px" />
        <Skeleton width="146px" height="16px" />
      </Stack>
    </TableCell>
  </TableRow>
);

const LiquidityTable = ({ data, isLoading }) => {
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
    { id: 'tokenPair', label: strings.tokenPair, align: 'left', sortType: 'character' },
    { id: 'DEX', label: strings.dex, align: 'left', sortType: 'character' },
    { id: 'firstTokenValue', label: strings.firstTokenValue, align: 'left', sortType: 'numeric' },
    { id: 'secondTokenValue', label: strings.secondTokenValue, align: 'left', sortType: 'numeric' },
    {
      id: 'lpTokens',
      label: strings.lpTokens,
      align: 'left',
      sortType: 'numeric',
    },
    {
      id: 'totalValue',
      label: strings.totalValue,
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
    <Table aria-label="liquidity table">
      <TableHead>
        <TableRow>
          {headCells.map(({ label, align, id }, index) => {
            const isFirstOrLastElement = index === 0 || index === headCells.length - 1;

            return (
              <TableCell key={id} align={align} sx={{ padding: `12.5px ${theme.spacing(2)}` }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={theme.spacing(1)}
                  onClick={() => (isFirstOrLastElement ? handleRequestSort(id) : null)}
                  sx={{
                    float: align,
                    cursor: isFirstOrLastElement ? 'pointer' : 'normal',
                    justifyContent: isFirstOrLastElement ? 'flex-start' : 'space-between',
                    width: isFirstOrLastElement ? 'fit-content' : '100%',
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.grayscale[600], userSelect: 'none' }}>
                    {label}
                  </Typography>
                  <Icon.Sort
                    id={id}
                    order={order}
                    orderBy={orderBy}
                    style={{ cursor: 'pointer' }}
                    onClick={() => (isFirstOrLastElement ? null : handleRequestSort(id))}
                  />
                </Stack>
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading
          ? Array.from({ length: 6 }).map((item, index) => <TableRowSkeleton id={index} theme={theme} />)
          : getSortedData(list).map(row => (
              <TableRow
                key={row.id}
                sx={{
                  transition: 'all 0.3s ease-in-out',
                  '& td': { border: 0 },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                    <Stack direction="row" alignItems="center" sx={{ position: 'relative', width: '46px' }}>
                      <Box
                        width="24px"
                        height="24px"
                        sx={{
                          borderRadius: `${theme.shape.borderRadius}px`,
                        }}
                        component="img"
                        src={adaPng}
                      ></Box>
                      <Box
                        width="24px"
                        height="24px"
                        sx={{
                          borderRadius: `${theme.shape.borderRadius}px`,
                          position: 'absolute',
                          top: 0,
                          left: '22px',
                        }}
                        component="img"
                        src={hoskyPng}
                      ></Box>
                    </Stack>
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.gray_c900 }}>
                      {row.firstToken.name} - {row.secondToken.name}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={theme.spacing(1)}
                    onClick={() =>
                      chrome.tabs.create({
                        url: row.DEXLink,
                      })
                    }
                    sx={{ width: 'fit-content', cursor: 'pointer' }}
                  >
                    <Box
                      width="32px"
                      height="32px"
                      sx={{
                        borderRadius: `${theme.shape.borderRadius}px`,
                      }}
                      component="img"
                      src={minswapPng}
                    ></Box>
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.primary_c600 }}>
                      {row.DEX}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography sx={{ color: theme.palette.ds.gray_c900 }}>
                      {row.firstTokenValue} {row.firstToken.name}
                    </Typography>
                    {row.firstToken.name === 'ADA' && unitOfAccount === 'ADA' ? null : (
                      <Typography variant="body2" sx={{ color: theme.palette.ds.gray_c600 }}>
                        {row.firstTokenValueUsd} {unitOfAccount}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography sx={{ color: theme.palette.ds.gray_c900 }}>
                      {row.secondTokenValue} {row.secondToken.name}
                    </Typography>
                    {row.secondToken.name === 'ADA' && unitOfAccount === 'ADA' ? null : (
                      <Typography variant="body2" sx={{ color: theme.palette.ds.gray_c600 }}>
                        {row.secondTokenValueUsd} {unitOfAccount}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.gray_c900 }}>{row.lpTokens}</Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography sx={{ color: theme.palette.ds.gray_c900, textAlign: 'right' }}>
                      {row.totalValue} {row.firstToken.name}
                    </Typography>
                    {unitOfAccount === 'ADA' && row.firstToken.name === 'ADA' ? null : (
                      <Typography variant="body2" sx={{ color: theme.palette.ds.gray_c600, textAlign: 'right' }}>
                        {row.totalValueUsd} {unitOfAccount}
                      </Typography>
                    )}
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
        <Typography variant="h4" fontWeight="500" sx={{ color: theme.palette.ds.black_static }}>
          {strings.noResultsForThisSearch}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default LiquidityTable;
