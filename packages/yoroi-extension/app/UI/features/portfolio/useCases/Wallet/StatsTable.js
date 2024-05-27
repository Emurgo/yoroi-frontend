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
import { default as SortIcon } from '../../../../components/icons/portfolio/Sort';
import { useNavigateTo } from '../../common/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StyledChip from '../../common/chip';
import ArrowIcon from '../../../../components/icons/portfolio/Arrow';
import adaPng from '../../../../../assets/images/ada.png';

const StatsTable = ({ data }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const { strings } = usePortfolio();

  const headCells = [
    { id: 'name', label: strings.name, align: 'left', sortType: 'character' },
    { id: 'price', label: strings.price, align: 'left', sortType: 'numeric' },
    { id: '24h', label: '24H', align: 'left', sortType: 'numeric' },
    { id: '1W', label: '1W', align: 'left', sortType: 'numeric' },
    { id: '1M', label: '1M', align: 'left', sortType: 'numeric' },
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

  const [{ order, orderBy }, setSortState] = useState({
    order: null,
    orderBy: null,
  });

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

  function descendingComparator(a, b, sortType) {
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
  }

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
    <Table
      sx={{
        marginTop: '25px',
      }}
      aria-label="stats table"
    >
      <TableHead>
        <TableRow>
          {headCells.map(({ label, align, id }) => (
            <TableCell key={id} align={align}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                onClick={() => handleRequestSort(id)}
                sx={{ float: align, cursor: 'pointer' }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.grayscale[600], userSelect: 'none' }}
                >
                  {label}
                </Typography>
                <SortIcon id={id} order={order} orderBy={orderBy} />
              </Stack>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {getSortedData(data).map(row => (
          <TableRow
            key={row.id}
            onClick={() => navigateTo.portfolioDetail(row.id)}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '& td, & th': { border: 0 },
              '&:hover': {
                backgroundColor: theme.palette.ds.gray_c50,
                borderRadius: `${theme.shape.borderRadius}px`,
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
                    backgroundColor: theme.palette.ds.gray_c700,
                  }}
                  component="img"
                  src={adaPng}
                ></Box>
                <Stack direction="column">
                  <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                    {row.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {row.id}
                  </Typography>
                </Stack>
              </Stack>
            </TableCell>

            <TableCell>
              <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                {row.price} USD
              </Typography>
            </TableCell>

            <TableCell>
              <StyledChip
                active={row['24h'] > 0}
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['24h'] > 0
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['24h'] > 0 ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography variant="caption1">
                      {row['24h'] > 0 ? row['24h'] : -1 * row['24h']}%
                    </Typography>
                  </Stack>
                }
                sx={{ cursor: 'pointer' }}
              />
            </TableCell>

            <TableCell>
              <StyledChip
                active={row['1W'] > 0}
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['1W'] > 0
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['1W'] > 0 ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography variant="caption1">
                      {row['1W'] > 0 ? row['1W'] : -1 * row['1W']}%
                    </Typography>
                  </Stack>
                }
                sx={{ cursor: 'pointer' }}
              />
            </TableCell>

            <TableCell>
              <StyledChip
                active={row['1M'] > 0}
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['1M'] > 0
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['1M'] > 0 ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography variant="caption1">
                      {row['1M'] > 0 ? row['1M'] : -1 * row['1M']}%
                    </Typography>
                  </Stack>
                }
                sx={{ cursor: 'pointer' }}
              />
            </TableCell>

            <TableCell>
              <Typography variant="body2" sx={{ color: theme.palette.ds.text_gray_medium }}>
                {row.portfolioPercents.toFixed(2)}&nbsp;%
              </Typography>
            </TableCell>

            <TableCell>
              <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
                <Stack direction="column">
                  <Typography fontWeight="500" sx={{ color: theme.palette.ds.text_gray_normal }}>
                    {row.totalAmount} {row.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.ds.text_gray_medium, textAlign: 'right' }}
                  >
                    {row.totalAmountUsd} USD
                  </Typography>
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StatsTable;
