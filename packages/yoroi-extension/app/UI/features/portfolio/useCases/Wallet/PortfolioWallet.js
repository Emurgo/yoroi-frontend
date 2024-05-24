import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Stack,
  Chip,
  Box,
  Input,
  InputAdornment,
  styled,
} from '@mui/material';
import { ReactComponent as Search } from '../../../../../assets/images/assets-page/search.inline.svg';
import React, { useState } from 'react';
import { StyledTooltip, SearchInput } from '../../../../components';
import Arrow from '../../../../components/icons/portfolio/Arrow';
import { default as SortIcon } from '../../../../components/icons/portfolio/Sort';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { useNavigateTo } from '../../common/useNavigateTo';

// const messages = defineMessages({
//   search: {
//     id: 'wallet.revamp.assets.search',
//     defaultMessage: '!!!Search by asset name or ID',
//   },
// });

const PortfolioWallet = ({ headCells, data }) => {
  const theme = useTheme();
  const navigateTo = useNavigateTo();
  const [keyword, setKeyword] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Stack direction="row" spacing={theme.spacing(0.5)}>
            <Typography variant="h2" fontWeight="500">
              200000,00
            </Typography>
            <Typography variant="body2" fontWeight="500" sx={{ marginTop: '5px' }}>
              ADA
              <Typography
                variant="body2"
                fontWeight="500"
                sx={{
                  display: 'inline',
                  marginTop: '5px',
                  color: theme.palette.ds.gray_c400,
                }}
              >
                /USD
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>10000,00 USD</Typography>
            <StyledTooltip
              title={
                <>
                  <Typography display={'block'}>% Balance performance</Typography>
                  <Typography display={'block'}>+/- Balance change</Typography>
                  <Typography display={'block'}>in 24 hours</Typography>
                </>
              }
              placement="right"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                sx={{ marginLeft: '20px' }}
              >
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Arrow
                        fill={theme.palette.ds.secondary_c800}
                        style={{ marginRight: '5px' }}
                      />
                      <Typography>0,03%</Typography>
                    </Stack>
                  }
                  sx={{
                    backgroundColor: theme.palette.ds.secondary_c100,
                    color: theme.palette.ds.secondary_c800,
                  }}
                ></Chip>
                <Chip
                  label={<Typography>+0,03 USD</Typography>}
                  sx={{
                    backgroundColor: theme.palette.ds.secondary_c100,
                    color: theme.palette.ds.secondary_c800,
                  }}
                ></Chip>
              </Stack>
            </StyledTooltip>
          </Stack>
        </Stack>

        <SearchInput
          disableUnderline
          onChange={e => setKeyword(e.target.value)}
          placeholder={'Search by asset name or ID'}
          startAdornment={
            <InputAdornment
              sx={{
                '> svg > use': {
                  fill: 'ds.text_gray_medium',
                },
              }}
              position="start"
            >
              <Search />
            </InputAdornment>
          }
        />
      </Stack>

      <Table
        sx={{
          marginTop: '25px',
        }}
        aria-label="transaction history table"
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
                  {row.price}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Arrow
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
                      <Typography>{row['24h'].percents}</Typography>
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
                      <Arrow
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
                      <Typography>{row['1W'].percents}</Typography>
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
                      <Arrow
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
                      <Typography>{row['1M'].percents}</Typography>
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
                    <Typography fontWeight="500">{row.totalAmount.amount}</Typography>
                    <Typography
                      sx={{ color: theme.palette.ds.text_gray_medium, textAlign: 'right' }}
                    >
                      {row.totalAmount.usd}
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default PortfolioWallet;
