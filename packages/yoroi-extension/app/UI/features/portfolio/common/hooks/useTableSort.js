// @flow
import { useCallback } from 'react';
import { TokenType, IHeadCell } from '../types/index';

export type TableSortType = 'character' | 'numeric';

interface Props {
  order: string;
  orderBy: string;
  setSortState: (sortState: { order: string, orderBy: string }) => void;
  headCells: IHeadCell[];
  data: TokenType[];
}

const useTableSort = ({ order, orderBy, setSortState, headCells, data }: Props) => {
  const handleRequestSort = (property: string) => {
    let direction = 'asc';
    if (order === 'asc') {
      if (property === orderBy) {
        direction = 'desc';
      }
    } else if (order === 'desc') {
      if (property === orderBy) {
        direction = null;
      }
    }
    setSortState({
      order: direction,
      orderBy: property,
    });
  };

  const descendingComparator = (a: any, b: any, sortType: TableSortType) => {
    switch (sortType) {
      case 'numeric':
        if (parseFloat(b[orderBy]) < parseFloat(a[orderBy])) {
          return -1;
        } else {
          return 1;
        }
      case 'character':
        return String(a[orderBy]).localeCompare(b[orderBy]);
      default:
        if (b[orderBy] < a[orderBy]) {
          return -1;
        } else {
          return 1;
        }
    }
  };

  const getSortedData = useCallback(
    (arr: any[]) => {
      if (!orderBy || !order) return data;
      const sortColumn = headCells.find(cell => cell.id === orderBy);
      const sortType = sortColumn?.sortType ?? 'character';
      return arr.sort((a, b) => {
        return order === 'desc' ? descendingComparator(a, b, sortType) : -descendingComparator(a, b, sortType);
      });
    },
    [order, orderBy, headCells]
  );

  return { getSortedData, handleRequestSort };
};

export default useTableSort;
