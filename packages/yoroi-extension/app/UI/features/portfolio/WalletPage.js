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
import { ReactComponent as Search } from '../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as ArrowUp } from './images/up-arrow.inline.svg';
import { ReactComponent as ArrowDown } from './images/down-arrow.inline.svg';
import { ReactComponent as TableSortIcon } from './images/table-sort.inline.svg';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { StyledTooltip, SearchInput } from '../../components';

const WalletPage = ({ headCells, mockData }) => {
  const history = useHistory();
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
          <Stack direction="row" spacing={0.5}>
            <Typography sx={{ fontWeight: 500, fontSize: '1.75rem', lineHeight: '2rem' }}>
              200000,00
            </Typography>
            <Typography
              sx={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: '22px', marginTop: '5px' }}
            >
              ADA
              <Typography
                sx={{
                  display: 'inline',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  lineHeight: '22px',
                  marginTop: '5px',
                  color: 'rgba(167, 175, 192, 1)',
                }}
              >
                /USD
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body-1-regular">10000,00 USD</Typography>
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ marginLeft: '20px' }}>
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <ArrowUp
                        fill="rgba(18, 112, 93, 1)"
                        width="10px"
                        height="10px"
                        style={{ marginRight: '5px' }}
                      />
                      <Typography>0,03%</Typography>
                    </Stack>
                  }
                  sx={{ backgroundColor: 'rgba(228, 247, 243, 1)', color: 'rgba(18, 112, 93, 1)' }}
                ></Chip>
                <Chip
                  label={<Typography>+0,03 USD</Typography>}
                  sx={{ backgroundColor: 'rgba(228, 247, 243, 1)', color: 'rgba(18, 112, 93, 1)' }}
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
                  fill: 'grayscale.600',
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
                <Stack direction="row" alignItems="center" spacing={1} sx={{ float: align }}>
                  <Typography variant="body-1-regular">{label}</Typography>
                  <TableSortIcon style={{ cursor: 'pointer' }} />
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map(row => (
            <TableRow
              key={row.id}
              onClick={() => history.push(`/portfolio/details/${row.id}`)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '& td, & th': { border: 0 },
                '&:hover': {
                  backgroundColor: '#f8f8f8',
                  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                },
              }}
            >
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    width="40px"
                    height="40px"
                    sx={{ borderRadius: '8px', backgroundColor: 'rgba(240, 243, 245, 1)' }}
                  ></Box>
                  <Stack direction="column">
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>{row.name}</Typography>
                    <Typography variant="body-1-regular">{row.id}</Typography>
                  </Stack>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body-1-regular">{row.price}</Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {row['24h'].active ? (
                        <ArrowUp
                          fill={'rgba(18, 112, 93, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      ) : (
                        <ArrowDown
                          fill={'rgba(207, 5, 58, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      )}
                      <Typography>{row['24h'].percents}</Typography>
                    </Stack>
                  }
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: row['24h'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['24h'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></Chip>
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {row['1W'].active ? (
                        <ArrowUp
                          fill={'rgba(18, 112, 93, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      ) : (
                        <ArrowDown
                          fill={'rgba(207, 5, 58, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      )}
                      <Typography>{row['1W'].percents}</Typography>
                    </Stack>
                  }
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: row['1W'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['1W'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></Chip>
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {row['1M'].active ? (
                        <ArrowUp
                          fill={'rgba(18, 112, 93, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      ) : (
                        <ArrowDown
                          fill={'rgba(207, 5, 58, 1)'}
                          width="10px"
                          height="10px"
                          style={{ marginRight: '5px' }}
                        />
                      )}
                      <Typography>{row['1M'].percents}</Typography>
                    </Stack>
                  }
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: row['1M'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['1M'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></Chip>
              </TableCell>

              <TableCell>
                <Typography variant="body-1-regular">{row.portfolioPercents}&nbsp;%</Typography>
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ float: 'right' }}>
                  <Stack direction="column">
                    <Typography sx={{ fontWeight: 400, fontSize: '1rem' }}>
                      {row.totalAmount.amount}
                    </Typography>
                    <Typography variant="body-1-regular" sx={{ textAlign: 'right' }}>{row.totalAmount.usd}</Typography>
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

export default WalletPage;
