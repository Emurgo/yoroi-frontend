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
import { tableCellClasses } from '@mui/material/TableCell';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { ReactComponent as Search } from '../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as ArrowUp } from '../../assets/images/portfolio/up-arrow.inline.svg';
import { ReactComponent as ArrowDown } from '../../assets/images/portfolio/down-arrow.inline.svg';
import { ReactComponent as TableSortIcon } from '../../assets/images/portfolio/table-sort.inline.svg';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

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
            <SubTitle>10000,00 USD</SubTitle>
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
                <StyledChip
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
                ></StyledChip>
                <StyledChip
                  label={<Typography>+0,03 USD</Typography>}
                  sx={{ backgroundColor: 'rgba(228, 247, 243, 1)', color: 'rgba(18, 112, 93, 1)' }}
                ></StyledChip>
              </Stack>
            </StyledTooltip>
          </Stack>
        </Stack>

        <SearchInput
          disableUnderline
          onChange={e => setKeyword(e.target.value)}
          placeholder={'Search by asset name or ID'}
          sx={{
            bgcolor: 'common.white',
            border: '1px solid',
            borderColor: 'grayscale.400',
            'input::placeholder': {
              color: 'grayscale.600',
            },
          }}
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
              <TableCell align={align} onClick={() => handleRequestSort(id)}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ float: align }}>
                  <SubTitle>{label}</SubTitle>
                  <TableSortIcon style={{ cursor: 'pointer' }} />
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map(row => (
            <TableRow
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
                  <Stack direction="column">
                    <Typography sx={{ fontWeight: 500, fontSize: '1rem' }}>{row.name}</Typography>
                    <SubTitle>{row.id}</SubTitle>
                  </Stack>
                </Stack>
              </TableCell>

              <TableCell>
                <SubTitle>{row.price}</SubTitle>
              </TableCell>

              <TableCell>
                <StyledChip
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
                    backgroundColor: row['24h'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['24h'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></StyledChip>
              </TableCell>

              <TableCell>
                <StyledChip
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
                    backgroundColor: row['1W'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['1W'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></StyledChip>
              </TableCell>

              <TableCell>
                <StyledChip
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
                    backgroundColor: row['1M'].active
                      ? 'rgba(228, 247, 243, 1)'
                      : 'rgba(255, 241, 245, 1)',
                    color: row['1M'].active ? 'rgba(18, 112, 93, 1)' : 'rgba(207, 5, 58, 1)',
                  }}
                ></StyledChip>
              </TableCell>

              <TableCell>
                <SubTitle>{row.portfolioPercents}&nbsp;%</SubTitle>
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ float: 'right' }}>
                  <Stack direction="column">
                    <Typography sx={{ fontWeight: 400, fontSize: '1rem' }}>
                      {row.totalAmount.amount}
                    </Typography>
                    <SubTitle sx={{ textAlign: 'right' }}>{row.totalAmount.usd}</SubTitle>
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

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const SearchInput = styled(Input)({
  backgroundColor: 'var(--yoroi-palette-gray-50)',
  borderRadius: '8px',
  width: '370px',
  height: '40px',
  padding: '10px 12px',
});

const Title = styled(Typography)({
  fontWeight: 500,
  fontSize: '1rem',
});

const SubTitle = styled(Typography)({
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: '1.5rem',
  color: 'rgba(107, 115, 132, 1)',
});

const StyledChip = styled(Chip)({
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: '1rem',
  cursor: 'pointer',
});

export default WalletPage;
