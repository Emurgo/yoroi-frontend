import React, { ReactElement, ReactNode, cloneElement } from 'react';
import { Table as MuiTable, TableBody, Stack, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStrings } from '../hooks/useStrings';
import noResultsPng from '../assets/illustrations/no-results.png';
import SortableTableHead from './SortableTableHead';
import { IHeadCell } from '../types/table';

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
}: Props): JSX.Element => {
  const theme = useTheme();
  const strings = useStrings();

  return data.length > 0 ? (
    <MuiTable aria-label={`${name} table`}>
      <SortableTableHead headCells={headCells} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
      <TableBody>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => cloneElement(TableRowSkeleton, { key: index, theme }))
          : children}
      </TableBody>
    </MuiTable>
  ) : (
    <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
        <Box component="img" src={noResultsPng}></Box>
        <Typography variant="h4" fontWeight="500" color="ds.black_static" sx={{ lineHeight: '26px' }}>
          {strings.noResultsForThisSearch}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Table;
