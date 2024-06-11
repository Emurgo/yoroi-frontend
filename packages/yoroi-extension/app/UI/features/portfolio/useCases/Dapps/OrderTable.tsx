import React, { useMemo, useState } from 'react';
import { TableCell, TableRow, Typography, Stack, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStrings } from '../../common/hooks/useStrings';
import adaPng from '../../../../../assets/images/ada.png';
import hoskyPng from '../../common/assets/images/hosky-token.png';
import minswapPng from '../../common/assets/images/minswap-dex.png';
import { Skeleton } from '../../../../components';
import { truncateAddressShort } from '../../../../../utils/formatters';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import Table from '../../common/components/Table';
import { IHeadCell } from '../../common/types/table';
import { OrderItemType } from '../../common/types/index';

const TableRowSkeleton = ({ theme, ...props }) => (
  <TableRow
    {...props}
    sx={{
      '& td': { border: 0 },
    }}
  >
    <TableCell>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        <Skeleton width="24px" height="24px" />
        <Skeleton width="55px" height="24px" />
        <Typography fontWeight="500" sx={{ color: theme.palette.ds.gray_c900 }}>
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

interface Props {
  data: OrderItemType[];
  isLoading: boolean;
}

const OrderTable = ({ data, isLoading }: Props): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: null,
    orderBy: null,
  });
  const list = useMemo(() => [...data], [data]);

  const headCells: IHeadCell[] = [
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
  const { getSortedData, handleRequestSort } = useTableSort({ order, orderBy, setSortState, headCells, data });

  return (
    <Table
      name="order"
      headCells={headCells}
      data={getSortedData(list)}
      order={order}
      orderBy={orderBy}
      handleRequestSort={handleRequestSort}
      isLoading={isLoading}
      TableRowSkeleton={<TableRowSkeleton theme={theme} />}
    >
      {getSortedData(list).map(row => (
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
              <Typography fontWeight="500" color="ds.gray_c900">
                {row.firstToken.name}
              </Typography>
              <Typography fontWeight="500" color="ds.gray_c900">
                /
              </Typography>
              <Box
                width="24px"
                height="24px"
                component="img"
                src={hoskyPng}
                sx={{
                  borderRadius: `${theme.shape.borderRadius}px`,
                }}
              ></Box>
              <Typography fontWeight="500" color="ds.gray_c900">
                {row.secondToken.name}
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
              <Typography fontWeight="500" color="ds.primary_c600">
                {row.DEX}
              </Typography>
            </Stack>
          </TableCell>

          <TableCell>
            <Typography color="ds.gray_c900">{row.assetPrice}</Typography>
          </TableCell>

          <TableCell>
            <Typography color="ds.gray_c900">{row.assetAmount}</Typography>
          </TableCell>

          <TableCell>
            <Typography
              onClick={() =>
                chrome.tabs.create({
                  url: `https://cardanoscan.io/transaction/${row.transactionId}`,
                })
              }
              color="ds.primary_c600"
              sx={{ cursor: 'pointer' }}
            >
              {truncateAddressShort(row.transactionId, 10)}
            </Typography>
          </TableCell>

          <TableCell>
            <Stack direction="column" spacing={theme.spacing(0.25)}>
              <Typography color="ds.gray_c900" sx={{ textAlign: 'right' }}>
                {row.totalValue} {row.firstToken.name}
              </Typography>
              {row.firstToken.name === 'ADA' && unitOfAccount === 'ADA' ? null : (
                <Typography variant="body2" color="ds.gray_c600" sx={{ textAlign: 'right' }}>
                  {row.totalValueUsd} {unitOfAccount}
                </Typography>
              )}
            </Stack>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default OrderTable;
