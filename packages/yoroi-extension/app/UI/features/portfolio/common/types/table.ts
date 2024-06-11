import { TableCellProps } from '@mui/material';

export type TableSortType = 'character' | 'numeric';

export interface IHeadCell {
  id: string;
  label: string;
  align: TableCellProps['align'];
  sortType?: TableSortType;
  disabledSort?: boolean;
  isPadding?: boolean;
}
