import { Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
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
import { formatNumber } from '../../common/helpers/formatHelper';
import { formatPriceChange, priceChange } from '../../common/helpers/priceChange';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
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
  const { unitOfAccount, accountPair } = usePortfolio();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: null,
    orderBy: null,
  });

  const list = useMemo(() => [...data], [data]);

  const {
    tokenActivity: { data24h },
    // isLoading: isActivityLoading,
  } = usePortfolioTokenActivity();
  const ptActivity = useCurrencyPairing().ptActivity;

  console.log('data24h', data24h);

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
              isPrimaryToken={row.policyId?.length === 0}
              ptActivity={ptActivity}
              unitOfAccount={unitOfAccount}
              secondaryToken24Activity={data24h && data24h[`${row.policyId}.${row.assetName}`]}
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            {data24h === null ? (
              <p>load</p>
            ) : (
              <TokenPriceChangeChip
                secondaryTokenActivity={data24h && data24h[`${row.policyId}.${row.assetName}`]}
                primaryTokenActivity={ptActivity}
                isPrimaryToken={row.policyId?.length === 0}
              />
            )}
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenChip token={row} />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenChip token={row} />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenProcentage
              procentage={
                row.info.policyId.length === 0 ? procentageData[''] : procentageData[`${row.policyId}.${row.assetName}`]
              }
            />
          </TableCell>

          <TableCell sx={{ padding: '16.8px 1rem' }}>
            {data24h === null ? (
              <p>load</p>
            ) : (
              <TokenPriceTotal
                // isPrimaryToken={row.policyId.length === 0}
                token={row}
                accountPair={accountPair}
                secondaryToken24Activity={data24h && data24h[`${row.policyId}.${row.assetName}`]}
              />
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

const TokenPriceChangeChip = ({ secondaryTokenActivity, primaryTokenActivity, isPrimaryToken }) => {
  const { close, open } = isPrimaryToken
    ? primaryTokenActivity
    : secondaryTokenActivity?.length && secondaryTokenActivity[1].price;

  const { changePercent, variantPnl } = priceChange(open, close);

  return (
    <PnlTag variant={variantPnl} withIcon>
      <Typography>{formatPriceChange(changePercent)}%</Typography>
    </PnlTag>
  );
};

const TokenPriceTotal = ({ token, accountPair, secondaryToken24Activity }) => {
  const theme: any = useTheme();
  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price.close;

  const {
    currency: selectedCurrency,
    config,
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  // const showingAda = isPrimaryTokenActive && amount.info.id !== portfolioPrimaryTokenInfo.id;
  const showingAda = accountPair?.from.name === 'ADA';

  const currency = selectedCurrency;
  const decimals = config.decimals;

  if (ptPrice == null) return `... ${currency}`;

  // if (!isPrimaryToken(amount.info) && tokenPrice == null) return `—— ${currency}`;

  // if (hidePrimaryPair && isPrimaryToken(amount.info) && isPrimaryTokenActive) return '';

  // Assuming token.quantity is a BigNumber and token.numberOfDecimals represents the number of decimals
  const decimalPlaces = token.numberOfDecimals;

  // Multiply the BigNumber by 10^decimalPlaces to shift the decimals
  const shiftedBigNumber = token.quantity.times(BigNumber(10).pow(decimalPlaces)); // Stay in BigNumber realm

  // Convert to bigint
  const bigIntValue = BigInt(shiftedBigNumber.toString(10)); // Convert BigNumber to string, then to BigInt

  // Ensure tokenPrice and ptPrice are BigNumber instances and convert if needed
  const safeTokenPrice = BigNumber.isBigNumber(tokenPrice) ? tokenPrice : new BigNumber(tokenPrice ?? '1');
  const safePtPrice = BigNumber.isBigNumber(ptPrice) ? ptPrice : new BigNumber(ptPrice ?? '1');

  // Now, pass the bigIntValue to atomicBreakdown
  const price = `${atomicBreakdown(bigIntValue, token.numberOfDecimals)
    .bn.times(safeTokenPrice) // BigNumber operation
    .times(showingAda ? 1 : safePtPrice) // BigNumber operation
    .toFormat(decimals)} ${currency}`;

  // console.log('token', {
  //   name: token.name,
  //   quantity: token.quantity,
  //   tokenCALCULATEDFINALPrice: price,
  //   selectedCurrency,
  //   tokenPrice: tokenPrice,
  //   showingAda,
  // });

  return (
    <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
      <Stack direction="column">
        <Typography color="ds.text_gray_normal">
          {token.totalAmount} {token.name}
        </Typography>
        {token.name === accountPair?.to.name ? (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
        ) : (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
            {price}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

const TokenPrice = ({ unitOfAccount, secondaryToken24Activity, ptActivity, isPrimaryToken }) => {
  const tokenPrice = isPrimaryToken ? ptActivity.close : secondaryToken24Activity && secondaryToken24Activity[1].price.close;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {formatPriceChange(tokenPrice)} {unitOfAccount}
    </Typography>
  );
};

const TokenProcentage = ({ procentage }) => {
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
