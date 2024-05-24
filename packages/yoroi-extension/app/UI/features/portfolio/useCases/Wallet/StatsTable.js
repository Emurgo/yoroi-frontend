import React, { useState } from 'react';
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
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { default as SortIcon } from '../../../../components/icons/portfolio/Sort';
import ArrowIcon from '../../../../components/icons/portfolio/Arrow';
import { useNavigateTo } from '../../common/useNavigateTo';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const StatsTable = ({ data }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const { strings } = usePortfolio();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const headCells = [
    { id: 'name', label: strings.name, align: 'left' },
    { id: 'price', label: strings.price, align: 'left' },
    { id: '24h', label: '24H', align: 'left' },
    { id: '1w', label: '1W', align: 'left' },
    { id: '1m', label: '1M', align: 'left' },
    { id: 'portfolioPercents', label: `${strings.portfolio} %`, align: 'left' },
    { id: 'totalAmount', label: strings.totalAmount, align: 'right' },
  ];

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
            <TableCell key={id} align={align} onClick={() => handleRequestSort(id)}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                sx={{ float: align }}
              >
                <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>{label}</Typography>
                <SortIcon style={{ cursor: 'pointer' }} />
              </Stack>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(row => (
          <TableRow
            key={row.id}
            onClick={() => navigateTo.portfolioDetail(row.id)}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '& td, & th': { border: 0 },
              '&:hover': {
                backgroundColor: theme.palette.ds.gray_c50,
                boxShadow: `0px 2px 10px ${theme.palette.ds.gray_c200}`,
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
                ></Box>
                <Stack direction="column">
                  <Typography fontWeight="500">{row.name}</Typography>
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                    {row.id}
                  </Typography>
                </Stack>
              </Stack>
            </TableCell>

            <TableCell>
              <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                {row.price} USD
              </Typography>
            </TableCell>

            <TableCell>
              <Chip
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['24h'].active
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['24h'].active ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography>{row['24h'].percents}%</Typography>
                  </Stack>
                }
                sx={{
                  cursor: 'pointer',
                  backgroundColor: row['24h'].active
                    ? theme.palette.ds.secondary_c100
                    : theme.palette.ds.sys_magenta_c100,
                  color: row['24h'].active
                    ? theme.palette.ds.secondary_c800
                    : theme.palette.ds.sys_magenta_c700,
                }}
              ></Chip>
            </TableCell>

            <TableCell>
              <Chip
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['1W'].active
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['1W'].active ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography>{row['1W'].percents}%</Typography>
                  </Stack>
                }
                sx={{
                  cursor: 'pointer',
                  backgroundColor: row['1W'].active
                    ? theme.palette.ds.secondary_c100
                    : theme.palette.ds.sys_magenta_c100,
                  color: row['1W'].active
                    ? theme.palette.ds.secondary_c800
                    : theme.palette.ds.sys_magenta_c700,
                }}
              ></Chip>
            </TableCell>

            <TableCell>
              <Chip
                label={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ArrowIcon
                      fill={
                        row['1M'].active
                          ? theme.palette.ds.secondary_c800
                          : theme.palette.ds.sys_magenta_c700
                      }
                      style={{
                        marginRight: '5px',
                        transform: row['1M'].active ? '' : 'rotate(180deg)',
                      }}
                    />
                    <Typography>{row['1M'].percents}%</Typography>
                  </Stack>
                }
                sx={{
                  cursor: 'pointer',
                  backgroundColor: row['1M'].active
                    ? theme.palette.ds.secondary_c100
                    : theme.palette.ds.sys_magenta_c100,
                  color: row['1M'].active
                    ? theme.palette.ds.secondary_c800
                    : theme.palette.ds.sys_magenta_c700,
                }}
              ></Chip>
            </TableCell>

            <TableCell>
              <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                {row.portfolioPercents}&nbsp;%
              </Typography>
            </TableCell>

            <TableCell>
              <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
                <Stack direction="column">
                  <Typography fontWeight="500">{row.totalAmount.amount} {row.name}</Typography>
                  <Typography sx={{ color: theme.palette.ds.text_gray_medium, textAlign: 'right' }}>
                    {row.totalAmount.usd} USD
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
