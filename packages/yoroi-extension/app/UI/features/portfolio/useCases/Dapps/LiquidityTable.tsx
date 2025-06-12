import { Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import adaPng from '../../../../../assets/images/ada.png';
import { Skeleton } from '../../../../components';
import hoskyPng from '../../common/assets/images/hosky-token.png';
import minswapPng from '../../common/assets/images/minswap-dex.png';
import Table from '../../common/components/Table';
import { formatNumber } from '../../common/helpers/formatHelper';
import { useStrings } from '../../common/hooks/useStrings';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import { LiquidityItemType } from '../../common/types/index';
import { IHeadCell } from '../../common/types/table';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const TableRowSkeleton = ({ theme, ...props }) => (
  <TableRow
    {...props}
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

interface Props {
  data: LiquidityItemType[];
  isLoading: boolean;
}

const LiquidityTable = ({ data, isLoading }: Props): React.ReactNode => {
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount, primaryTokenInfo } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: null,
    orderBy: null,
  });
  const list = useMemo(() => [...data], [data]);

  const headCells: IHeadCell[] = [
    { id: 'tokenPair', label: strings.tokenPair, align: 'left', sortType: 'character' },
    { id: 'DEX', label: strings.dex, align: 'left', sortType: 'character', isPadding: true },
    { id: 'firstTokenValue', label: strings.firstTokenValue, align: 'left', sortType: 'numeric', isPadding: true },
    { id: 'secondTokenValue', label: strings.secondTokenValue, align: 'left', sortType: 'numeric', isPadding: true },
    {
      id: 'lpTokens',
      label: strings.lpTokens,
      align: 'left',
      sortType: 'numeric',
      isPadding: true,
    },
    {
      id: 'totalValue',
      label: strings.totalValue,
      align: 'right',
      sortType: 'numeric',
    },
  ];
  const { getSortedData, handleRequestSort } = useTableSort({ order, orderBy, setSortState, headCells, data });

  return (
    <Table
      name="liquidity"
      headCells={headCells}
      data={getSortedData(list)}
      order={order}
      orderBy={orderBy}
      handleRequestSort={handleRequestSort}
      isLoading={isLoading}
      TableRowSkeleton={<TableRowSkeleton theme={theme} />}
    >
      {getSortedData(list).map((row: LiquidityItemType) => (
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
              <Typography fontWeight="500" color="ds.gray_900">
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
              <Typography fontWeight="500" color="ds.primary_500">
                {row.DEX}
              </Typography>
            </Stack>
          </TableCell>

          <TableCell>
            <Stack direction="column" spacing={theme.spacing(0.25)}>
              <Typography color="ds.gray_900">
                {formatNumber(row.firstTokenValue)} {row.firstToken.name}
              </Typography>
              {row.firstToken.name === primaryTokenInfo.name && unitOfAccount === primaryTokenInfo.name ? null : (
                <Typography variant="body2" sx={{ color: theme.palette.ds.gray_600 }}>
                  {formatNumber(row.firstTokenValueUsd)} {unitOfAccount}
                </Typography>
              )}
            </Stack>
          </TableCell>

          <TableCell>
            <Stack direction="column" spacing={theme.spacing(0.25)}>
              <Typography color="ds.gray_900">
                {formatNumber(row.secondTokenValue)} {row.secondToken.name}
              </Typography>
              {row.secondToken.name === primaryTokenInfo.name && unitOfAccount === primaryTokenInfo.name ? null : (
                <Typography variant="body2" sx={{ color: theme.palette.ds.gray_600 }}>
                  {formatNumber(row.secondTokenValueUsd)} {unitOfAccount}
                </Typography>
              )}
            </Stack>
          </TableCell>

          <TableCell>
            <Typography color="ds.gray_900">{formatNumber(row.lpTokens)}</Typography>
          </TableCell>

          <TableCell>
            <Stack direction="column" spacing={theme.spacing(0.25)}>
              <Typography color="ds.gray_900" sx={{ textAlign: 'right' }}>
                {formatNumber(row.totalValue)} {row.firstToken.name}
              </Typography>
              {unitOfAccount === primaryTokenInfo.name && row.firstToken.name === primaryTokenInfo.name ? null : (
                <Typography variant="body2" color="ds.gray_600" sx={{ textAlign: 'right' }}>
                  {formatNumber(row.totalValueUsd)} {unitOfAccount}
                </Typography>
              )}
            </Stack>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default LiquidityTable;
