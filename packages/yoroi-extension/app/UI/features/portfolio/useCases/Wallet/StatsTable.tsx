import { Box, Skeleton, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import React, { useMemo, useState } from 'react';
import { Chip } from '../../../../components';
import { ChipTypes } from '../../../../components/Chip';
import { Icon } from '../../../../components/icons';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import tokenPng from '../../common/assets/images/token.png';
import PnlTag from '../../common/components/PlnTag';
import Table from '../../common/components/Table';
import { TableRowSkeleton } from '../../common/components/TableRowSkeleton';
import { TOKEN_CHART_INTERVAL } from '../../common/helpers/constants';
import { formatNumber } from '../../common/helpers/formatHelper';
import { formatPriceChange, priceChange } from '../../common/helpers/priceChange';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { useStrings } from '../../common/hooks/useStrings';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import { useTokenPercentages } from '../../common/hooks/useTokenPercentages';
import { TokenType } from '../../common/types/index';
import { IHeadCell } from '../../common/types/table';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';

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

  const {
    tokenActivity: { data24h, data7d, data30d },
    // isLoading: isActivityLoading,
  } = usePortfolioTokenActivity();
  const ptActivity = useCurrencyPairing().ptActivity;

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

  // TODO refactor and add calculation based on fiat toatl value - endpoint not working
  const procentageData = useTokenPercentages(data);
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
      {getSortedData(list).map((row: any) => (
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
            <TokenDisplay token={row} />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPrice
              isPrimaryToken={row.info.policyId?.length === 0}
              ptActivity={ptActivity}
              unitOfAccount={unitOfAccount}
              secondaryToken24Activity={data24h && data24h[`${row.info.policyId}.${row.assetName}`]}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem', display: 'flex', marginTop: '10px' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data24h && data24h[`${row.info.policyId}.${row.assetName}`]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={row.info.policyId?.length === 0}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem', border: '1px solid red' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data7d && data7d[`${row.info.policyId}.${row.assetName}`]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={row.info.policyId?.length === 0}
              timeInterval={TOKEN_CHART_INTERVAL.WEEK}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data30d && data30d[`${row.info.policyId}.${row.assetName}`]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={row.info.policyId?.length === 0}
              timeInterval={TOKEN_CHART_INTERVAL.MONTH}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenProcentage
              procentage={
                row.info.policyId.length === 0 ? procentageData[''] : procentageData[`${row.info.policyId}.${row.assetName}`]
              }
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            {data24h === null ? (
              <Skeleton variant="text" width="50px" height="30px" />
            ) : (
              <TokenPriceTotal token={row} secondaryToken24Activity={data24h && data24h[row.info.id]} />
            )}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default StatsTable;

const TokenDisplay = ({ token }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
      <Box
        width="40px"
        height="40px"
        sx={{
          borderRadius: `${theme.shape.borderRadius}px`,
        }}
        component="img"
        src={token.tokenLogo || tokenPng}
      ></Box>
      <Stack direction="column">
        <Typography fontWeight="500" color="ds.text_gray_normal">
          {token.name}
        </Typography>
        <Typography variant="body2" color="ds.text_gray_medium">
          {token.ticker}
        </Typography>
      </Stack>
    </Stack>
  );
};

const TokenPriceChangeChip = ({ secondaryTokenActivity, primaryTokenActivity, isPrimaryToken, timeInterval }) => {
  const { data: ptTokenDataInterval, isFetching } = useGetPortfolioTokenChart(timeInterval, { info: { id: '' } });

  if (secondaryTokenActivity === null || primaryTokenActivity === null || isFetching) {
    return <Skeleton variant="text" width="50px" height="30px" />;
  }

  const tokenPriceClose = isPrimaryToken
    ? primaryTokenActivity.close
    : secondaryTokenActivity && secondaryTokenActivity[1].price.close;

  const tokenPriceOpen = isPrimaryToken
    ? primaryTokenActivity.open
    : secondaryTokenActivity && secondaryTokenActivity[1].price.open;

  const { changePercent, variantPnl } = priceChange(tokenPriceOpen, tokenPriceClose);

  return (
    <Box sx={{ display: 'flex' }}>
      <PnlTag variant={variantPnl} withIcon>
        <Typography fontSize="13px">
          {formatPriceChange(isPrimaryToken ? ptTokenDataInterval[50]?.changePercent : changePercent)}%
        </Typography>
      </PnlTag>
    </Box>
  );
};

const TokenPriceTotal = ({ token, secondaryToken24Activity }) => {
  const theme: any = useTheme();
  const { accountPair, primaryTokenInfo, walletBalance } = usePortfolio();

  const isPrimary: boolean = token.info.policyId?.length === 0;

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price.close;
  const tokenQuantityAsBigInt = bigNumberToBigInt(token.quantity);

  const showingAda = accountPair?.from.name === 'ADA';
  const currency = accountPair?.from.name;
  const decimals = showingAda ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

  if (ptPrice == null) return `... ${currency}`;

  const totaPrice = atomicBreakdown(tokenQuantityAsBigInt, decimals)
    .bn.times(tokenPrice ?? 1)
    .times(showingAda ? 1 : String(ptPrice))
    .toFormat(decimals);

  const totalTokenPrice = isPrimary && showingAda ? accountPair?.to.value : totaPrice;
  const totalTicker = isPrimary && showingAda ? accountPair?.to.name : accountPair?.from.name;

  return (
    <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
      <Stack direction="column">
        <Typography color="ds.text_gray_normal">
          {isPrimary ? walletBalance?.ada : token.totalAmount} {token.name}
        </Typography>
        {token.name === accountPair?.to.name ? (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
        ) : (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
            {totalTokenPrice} {totalTicker || 'USD'}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

const TokenPrice = ({ unitOfAccount, secondaryToken24Activity, ptActivity, isPrimaryToken }) => {
  const tokenPrice = isPrimaryToken ? ptActivity.close : secondaryToken24Activity && secondaryToken24Activity[1].price.close;
  if (tokenPrice == null) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {formatPriceChange(tokenPrice)} {unitOfAccount}
    </Typography>
  );
};

const TokenProcentage = ({ procentage }) => {
  if (procentage === undefined) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {procentage}%
    </Typography>
  );
};

// MOCK DATA
const TokenChip = ({ token }) => {
  const theme = useTheme();
  return (
    <Chip
      type={token['1M'] > 0 ? ChipTypes.ACTIVE : token['1M'] < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
      label={
        <Stack justifyContent="space-between" alignItems="center">
          {token['1M'] > 0 ? (
            // @ts-ignore
            <Icon.ChevronUp fill={theme.palette.ds.secondary_c800} />
          ) : token['1M'] < 0 ? (
            // @ts-ignore
            <Icon.ChevronDown fill={theme.palette.ds.sys_magenta_c700} />
          ) : null}
          {/* @ts-ignore */}
          <Typography variant="caption1">
            {token['1M'] >= 0 ? formatNumber(token['1M']) : formatNumber(-1 * token['1M'])}%
          </Typography>
        </Stack>
      }
      sx={{ cursor: 'pointer' }}
    />
  );
};

function bigNumberToBigInt(bn: BigNumber): bigint {
  // Convert BigNumber to a string representation of a whole number
  const wholeNumberString = bn.toFixed(0); // 0 means no decimals

  // Convert the string to BigInt
  const bigIntValue = BigInt(wholeNumberString);

  return bigIntValue;
}
