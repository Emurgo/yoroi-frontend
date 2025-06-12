import { Box, Table as MuiTable, Stack, TableBody, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactElement, ReactNode, cloneElement } from 'react';
import noResultsPng from '../assets/illustrations/no-results.png';
import { useStrings } from '../hooks/useStrings';
import { IHeadCell } from '../types/table';
import SortableTableHead from './SortableTableHead';

interface Props {
  name: string;
  headCells: IHeadCell[];
  data: any[];
  order: string | null;
  orderBy: string | null;
  handleRequestSort: (id: string) => void;
  isLoading: boolean;
  TableRowSkeleton: ReactElement;
  children: ReactNode;
}

const Table = ({
  name,
  headCells,
  data,
  order,
  orderBy,
  handleRequestSort,
  isLoading,
  TableRowSkeleton,
  children,
}: Props): React.ReactNode => {
  const theme = useTheme();
  const strings = useStrings();

  return data.length > 0 ? (
    <MuiTable aria-label={`${name} table`}>
      <SortableTableHead headCells={headCells} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
      <TableBody>
        {isLoading ? Array.from({ length: 6 }).map((_, index) => cloneElement(TableRowSkeleton, { key: index })) : children}
      </TableBody>
    </MuiTable>
  ) : (
    <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
        <Box component="img" src={noResultsPng}></Box>
        <Typography variant="h4" fontWeight="500" color="ds.text_gray_medium" sx={{ lineHeight: '26px' }}>
          {strings.noResultsForThisSearch}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Table;
