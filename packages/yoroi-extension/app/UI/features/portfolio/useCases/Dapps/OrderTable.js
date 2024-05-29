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
import { default as SortIcon } from '../../common/assets/icons/Sort';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import ArrowIcon from '../../common/assets/icons/Arrow';
import adaPng from '../../../../../assets/images/ada.png';
import hoskyPng from '../../common/assets/images/hosky-token.png';
import minswapPng from '../../common/assets/images/minswap-dex.png';
import { Chip } from '../../common/components/Chip';
import { Skeleton } from '../../../../components/Skeleton';
import { truncateAddressShort } from '../../../../../utils/formatters';

const TableRowSkeleton = ({ id, theme }) => (
  <TableRow
    key={id}
    sx={{
      '& td': { border: 0 },
    }}
  >
    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Skeleton width="24px" height="24px" />
        <Skeleton width="55px" height="24px" />
        <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
          /
        </Typography>
        <Skeleton width="24px" height="24px" />
        <Skeleton width="55px" height="24px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Skeleton width="32px" height="32px" />
        <Skeleton width="126px" height="24px" />
      </Stack>
    </TableCell>

    <TableCell>
      <Skeleton width="55px" height="24px" />
    </TableCell>

    <TableCell>
      <Skeleton width="55px" height="24px" />
    </TableCell>

    <TableCell>
      <Skeleton width="126px" height="24px" />
    </TableCell>

    <TableCell>
      <Stack direction="column" spacing={theme.spacing(0.25)} sx={{ float: 'right' }}>
        <Skeleton width="146px" height="24px" />
        <Skeleton width="146px" height="16px" />
      </Stack>
    </TableCell>
  </TableRow>
);

const OrderTable = ({ data, isLoading }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const { strings } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState({
    order: null,
    orderBy: null,
  });

  const headCells = [
    { id: 'pair', label: strings.pair, align: 'left', disabledSort: true },
    { id: 'DEX', label: strings.dex, align: 'left', disabledSort: true },
    { id: 'assetPrice', label: strings.assetPrice, align: 'left', disabledSort: true },
    { id: 'assetAmount', label: strings.assetAmount, align: 'left', disabledSort: true },
    { id: 'transactionId', label: strings.transactionId, align: 'left', disabledSort: true },
    {
      id: 'totalValue',
      label: strings.totalValue,
      align: 'right',
      disabledSort: false,
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
    <Table aria-label="order table">
      <TableHead>
        <TableRow>
          {headCells.map(({ label, align, id, disabledSort }) => (
            <TableCell key={id} align={align}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                onClick={() => !disabledSort && handleRequestSort(id)}
                sx={{ float: align, cursor: disabledSort ? 'normal' : 'pointer' }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.grayscale[600], userSelect: 'none' }}
                >
                  {label}
                </Typography>
                {disabledSort ? null : <SortIcon id={id} order={order} orderBy={orderBy} />}
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
                    <Box
                      width="24px"
                      height="24px"
                      sx={{
                        borderRadius: `${theme.shape.borderRadius}px`,
                      }}
                      component="img"
                      src={adaPng}
                    ></Box>
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                      {row.firstToken.name}
                    </Typography>
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                      /
                    </Typography>
                    <Box
                      width="24px"
                      height="24px"
                      sx={{
                        borderRadius: `${theme.shape.borderRadius}px`,
                      }}
                      component="img"
                      src={hoskyPng}
                    ></Box>
                    <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                      {row.secondToken.name}
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
                  <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>
                    {row.assetPrice}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.text_gray_normal }}>
                    {row.assetAmount}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: theme.palette.ds.text_primary_medium }}>
                    {truncateAddressShort(row.transactionId, 10)}
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

export default OrderTable;
