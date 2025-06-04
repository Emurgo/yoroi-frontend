import { TableCell, TableRow, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import Table from '../../common/components/Table';
import { TableRowSkeleton } from '../../common/components/TableRowSkeleton';
import { TOKEN_CHART_INTERVAL } from '../../common/helpers/constants';
import { isPrimaryToken } from '../../common/helpers/isPrimary';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import useTableSort, { ISortState } from '../../common/hooks/useTableSort';
import { TokenType } from '../../common/types/index';
import { IHeadCell } from '../../common/types/table';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';
import { TokenDisplay, TokenPrice, TokenPriceChangeChip, TokenPriceTotal, TokenProcentage } from './TableColumnsChip';
import { useProcessedTokenData } from './useProcentage';

const STableRow = styled(TableRow)(({ theme }: any) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  borderRadius: `${theme.shape.borderRadius}px`,
  '& td': { border: 0 },
  '&:hover': {
    backgroundColor: theme.palette.ds.bg_color_min,
  },
}));
const STableCell = styled(TableCell)(() => ({
  width: '15%',
}));

interface Props {
  data: TokenType[];
  isLoading: boolean;
  stores: any;
}

const StatsTable = ({ data, stores }: Props): JSX.Element => {
  const theme: any = useTheme();
  const { showWelcomeBanner } = usePortfolio();
  const navigateTo = useNavigateTo();
  const strings = useStrings();
  const [{ order, orderBy }, setSortState] = useState<ISortState>({
    order: '',
    orderBy: '',
  });
  const list = useMemo(() => [...data], [data]);

  const {
    tokenActivity: { data24h, data7d, data30d },
    isLoading,
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

  const assetFormatedList = useProcessedTokenData({ data: list, ptActivity, data24h, data30d, data7d });

  const { getSortedData, handleRequestSort } = useTableSort({ order, orderBy, setSortState, headCells, data: assetFormatedList });
  return (
    <Table
      name="stat"
      headCells={headCells}
      data={getSortedData(assetFormatedList)}
      order={order}
      orderBy={orderBy}
      handleRequestSort={handleRequestSort}
      isLoading={isLoading && !showWelcomeBanner}
      TableRowSkeleton={<TableRowSkeleton theme={theme} />}
    >
      {getSortedData(assetFormatedList).map((row: any) => (
        <STableRow key={row.id} onClick={() => navigateTo.portfolioDetail(row.id)}>
          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenDisplay token={row} />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPrice ptActivity={ptActivity} secondaryToken24Activity={data24h && data24h[row.info.id]} token={row} />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data24h && data24h[row.info.id]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={isPrimaryToken(row)}
            />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem', border: '1px solid red' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data7d && data7d[row.info.id]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={isPrimaryToken(row)}
              timeInterval={TOKEN_CHART_INTERVAL.WEEK}
            />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPriceChangeChip
              secondaryTokenActivity={data30d && data30d[row.info.id]}
              primaryTokenActivity={ptActivity}
              isPrimaryToken={isPrimaryToken(row)}
              timeInterval={TOKEN_CHART_INTERVAL.MONTH}
            />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenProcentage procentage={row.percentage} />
          </STableCell>

          <STableCell sx={{ padding: '16.8px 1rem' }}>
            <TokenPriceTotal token={row} secondaryToken24Activity={data24h && data24h[row.info.id]} stores={stores} />
          </STableCell>
        </STableRow>
      ))}
    </Table>
  );
};

export default StatsTable;
