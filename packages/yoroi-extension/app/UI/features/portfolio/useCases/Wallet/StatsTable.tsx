import React from 'react';
import { useMemo, useState } from 'react';
import { TableCell, TableRow, Typography, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import tokenPng from '../../common/assets/images/token.png';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Chip, Skeleton } from '../../../../components';
import { Icon } from '../../../../components/icons';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import Table from '../../common/components/Table';
import { IHeadCell } from '../../common/types/table';
import { TokenType } from '../../common/types/index';
import { ChipTypes } from '../../../../components/Chip';
import { formatNumber } from '../../common/helpers/formatHelper';

const TableRowSkeleton = ({ theme, ...props }) => (
  <TableRow
    {...props}
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

interface Props {
  data: TokenType[];
  isLoading: boolean;
}

const StatsTable = ({ data, isLoading }: Props): JSX.Element => {
  const theme: any = useTheme();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: null,
    orderBy: null,
  });
  const list = useMemo(() => [...data], [data]);

  const headCells: IHeadCell[] = [
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
  const { getSortedData, handleRequestSort } = useTableSort({ order, orderBy, setSortState, headCells, data });

  return (
    <Table
      name="stat"
      headCells={headCells}
      data={getSortedData(list)}
      order={order}
      orderBy={orderBy}
      handleRequestSort={handleRequestSort}
      isLoading={isLoading}
      TableRowSkeleton={<TableRowSkeleton theme={theme} />}
    >
      {getSortedData(list).map((row: TokenType) => (
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
          <TableCell sx={{ padding: '16.8px 1rem' }}>
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
                <Typography fontWeight="500" color="ds.text_gray_medium">
                  {row.name}
                </Typography>
                <Typography variant="body2" color="ds.text_gray_low">
                  {row.id}
                </Typography>
              </Stack>
            </Stack>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {formatNumber(row.price)} USD
            </Typography>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Chip
              type={row['24h'] > 0 ? ChipTypes.ACTIVE : row['24h'] < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
              label={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {row['24h'] > 0 ? (
                    <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                  ) : row['24h'] < 0 ? (
                    <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                  ) : null}
                  {/* @ts-ignore */}
                  <Typography variant="caption1">
                    {row['24h'] >= 0 ? formatNumber(row['24h']) : formatNumber(-1 * row['24h'])}%
                  </Typography>
                </Stack>
              }
              sx={{ cursor: 'pointer' }}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Chip
              type={row['1W'] > 0 ? ChipTypes.ACTIVE : row['1W'] < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
              label={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {row['1W'] > 0 ? (
                    <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                  ) : row['1W'] < 0 ? (
                    <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                  ) : null}
                  {/* @ts-ignore */}
                  <Typography variant="caption1">
                    {row['1W'] >= 0 ? formatNumber(row['1W']) : formatNumber(-1 * row['1W'])}%
                  </Typography>
                </Stack>
              }
              sx={{ cursor: 'pointer' }}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Chip
              type={row['1M'] > 0 ? ChipTypes.ACTIVE : row['1M'] < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
              label={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {row['1M'] > 0 ? (
                    <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                  ) : row['1M'] < 0 ? (
                    <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                  ) : null}
                  {/* @ts-ignore */}
                  <Typography variant="caption1">
                    {row['1M'] >= 0 ? formatNumber(row['1M']) : formatNumber(-1 * row['1M'])}%
                  </Typography>
                </Stack>
              }
              sx={{ cursor: 'pointer' }}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Typography variant="body2" color="ds.text_gray_low">
              {formatNumber(row.portfolioPercents)} %
            </Typography>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
              <Stack direction="column">
                <Typography color="ds.text_gray_medium">
                  {formatNumber(row.totalAmount)} {row.name}
                </Typography>
                {row.name === 'ADA' && unitOfAccount === 'ADA' ? null : (
                  <Typography variant="body2" color="ds.text_gray_low" sx={{ textAlign: 'right' }}>
                    {formatNumber(row.totalAmountUsd)} {unitOfAccount}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default StatsTable;
