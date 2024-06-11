import { TableCellProps } from '@mui/material';
import { TableSortType } from '../hooks/useTableSort';

export interface IHeadCell {
  id: string;
  label: string;
  align: TableCellProps['align'];
  sortType?: TableSortType;
  disabledSort?: boolean;
  isPadding?: boolean;
}
