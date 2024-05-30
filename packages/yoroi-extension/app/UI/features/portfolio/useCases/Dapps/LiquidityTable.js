import React, { useCallback, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowIcon, SortIcon } from '../../common/assets/icons/';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import adaPng from '../../../../../assets/images/ada.png';
import hoskyPng from '../../common/assets/images/hosky-token.png';
import minswapPng from '../../common/assets/images/minswap-dex.png';
import { Chip } from '../../common/components/Chip';
import { Skeleton } from '../../../../components/Skeleton';

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
          <Skeleton
            width="24px"
            height="24px"
            sx={{ position: 'absolute', top: 0, left: '22px' }}
          />
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
      <Stack direction="column" spacing={theme.spacing(0.25)}>
        <Skeleton width="65px" height="24px" />
        <Skeleton width="65px" height="20px" />
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
  const { strings } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState({
    order: null,
    orderBy: null,
  });

  const headCells = [
    { id: 'tokenPair', label: strings.tokenPair, align: 'left', sortType: 'character' },
    { id: 'DEX', label: strings.dex, align: 'left', sortType: 'character' },
    { id: 'firstTokenValue', label: strings.firstTokenValue, align: 'left', sortType: 'numeric' },
    { id: 'secondTokenValue', label: strings.secondTokenValue, align: 'left', sortType: 'numeric' },
    { id: 'PNLValue', label: strings.pnl, align: 'left', sortType: 'numeric' },
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
    data => {
      if (!orderBy || !order) return data;
      const sortColumn = headCells.find(cell => cell.id === orderBy);
      const sortType = sortColumn?.sortType ?? 'character';
      return data.sort((a, b) => {
        return order === 'desc'
          ? descendingComparator(a, b, sortType)
          : -descendingComparator(a, b, sortType);
      });
    },
    [order, orderBy, headCells]
  );

  return (
    <Table aria-label="liquidity table">
      <TableHead>
        <TableRow>
          {headCells.map(({ label, align, id }, index) => (
            <TableCell key={id} align={align} sx={{ padding: `12.5px ${theme.spacing(2)}` }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                onClick={() =>
                  index === 0 || index === headCells.length - 1 ? handleRequestSort(id) : null
                }
                sx={{
                  float: align,
                  cursor: index === 0 || index === headCells.length - 1 ? 'pointer' : 'normal',
                  justifyContent:
                    index === 0 || index === headCells.length - 1 ? 'flex-start' : 'space-between',
                  width: index === 0 || index === headCells.length - 1 ? 'fit-content' : '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.grayscale[600], userSelect: 'none' }}
                >
                  {label}
                </Typography>
                <SortIcon
                  id={id}
                  order={order}
                  orderBy={orderBy}
                  style={{ cursor: 'pointer ' }}
                  onClick={() =>
                    index === 0 || index === headCells.length - 1 ? null : handleRequestSort(id)
                  }
                />
              </Stack>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoading
          ? Array.from([1, 2, 3]).map((item, index) => (
              <TableRowSkeleton id={index} theme={theme} />
            ))
          : getSortedData(data).map(row => (
              <TableRow
                key={row.id}
                sx={{
                  transition: 'all 0.3s ease-in-out',
                  '& td': { border: 0 },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{ position: 'relative', width: '46px' }}
                    >
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
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                      {row.firstToken.name} - {row.secondToken.name}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
                    <Box
                      width="32px"
                      height="32px"
                      sx={{
                        borderRadius: `${theme.shape.borderRadius}px`,
                      }}
                      component="img"
                      src={minswapPng}
                    ></Box>
                    <Typography
                      fontWeight="500"
                      sx={{ color: theme.palette.ds.text_primary_medium }}
                    >
                      {row.DEX}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>
                      {row.firstTokenValue} {row.firstToken.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                      {row.firstTokenValueUsd} USD
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>
                      {row.secondTokenValue} {row.secondToken.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                      {row.secondTokenValueUsd} USD
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography>
                      {row.PNLValue} {row.firstToken.name}
                    </Typography>
                    <Chip
                      active={row.PNLValueUsd > 0}
                      label={
                        <Typography variant="caption1">
                          {row.PNLValueUsd > 0 ? '+' : '-'}
                          {row.PNLValueUsd} USD
                        </Typography>
                      }
                    />
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>
                    {row.lpTokens}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="column" spacing={theme.spacing(0.25)}>
                    <Typography
                      sx={{ color: theme.palette.ds.text_gray_normal, textAlign: 'right' }}
                    >
                      {row.totalValue} {row.firstToken.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.ds.text_gray_medium, textAlign: 'right' }}
                    >
                      {row.totalValueUsd} USD
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};

export default LiquidityTable;
