import { Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Chip, Skeleton } from '../../../../components';
import { ChipTypes } from '../../../../components/Chip';
import { Icon } from '../../../../components/icons';
import tokenPng from '../../common/assets/images/token.png';
import PnlTag from '../../common/components/PlnTag';
import Table from '../../common/components/Table';
import { formatNumber } from '../../common/helpers/formatHelper';
import { priceChange } from '../../common/helpers/priceChange';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import { TokenType } from '../../common/types/index';
import { IHeadCell } from '../../common/types/table';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';

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
  const { unitOfAccount, accountPair } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: null,
    orderBy: null,
  });

  const list = useMemo(() => [...data], [data]);

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

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
                src={row.tokenLogo || tokenPng}
              ></Box>
              <Stack direction="column">
                <Typography fontWeight="500" color="ds.text_gray_normal">
                  {row.name}
                </Typography>
                <Typography variant="body2" color="ds.text_gray_medium">
                  {row.ticker}
                </Typography>
              </Stack>
            </Stack>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Typography variant="body2" color="ds.text_gray_medium">
              {formatNumber(row.price)} {unitOfAccount}
            </Typography>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPriceChangeChip
              priceData={data24h && data24h[`${row.policyId}.${row.assetName}`]}
              isPrimaryToken={row.policyId.length === 0}
            />
            {/* <Chip
              type={row['24h'] > 0 ? ChipTypes.ACTIVE : row['24h'] < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
              label={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {row['24h'] > 0 ? (
                    <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                  ) : row['24h'] < 0 ? (
                    <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                  ) : null}
                  <Typography variant="caption1">
                    {row['24h'] >= 0 ? formatNumber(row['24h']) : formatNumber(-1 * row['24h'])}%
                  </Typography>
                </Stack>
              }
              sx={{ cursor: 'pointer' }}
            /> */}
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
            <Typography variant="body2" color="ds.text_gray_medium">
              {formatNumber(row.portfolioPercents)} %
            </Typography>
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
              <Stack direction="column">
                <Typography color="ds.text_gray_normal">
                  {row.totalAmount} {row.name}
                </Typography>
                {row.name === accountPair?.to.name ? (
                  <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
                ) : (
                  <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
                    {formatNumber(row.totalAmountFiat)} {accountPair?.to.name}
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

const TokenPriceChangeChip = ({ priceData, isPrimaryToken }) => {
  console.log('TokenPriceChangeChip PROPS', { isPrimaryToken, priceData });
  if (priceData === undefined) {
    return <p>loafing</p>;
  }
  const { close, open } = priceData[1].price;

  const { changePercent, variantPnl } = priceChange(open, close);

  return (
    <PnlTag variant={variantPnl} withIcon>
      <Typography>{changePercent}%</Typography>
    </PnlTag>
  );
};
