import { useCallback } from 'react';
import { IHeadCell, TableSortType } from '../types/table';

export interface ISortState {
  order: string | null;
  orderBy: string | null;
}

interface Props {
  order: string | null;
  orderBy: string | null;
  setSortState: React.Dispatch<React.SetStateAction<ISortState>>;
  headCells: IHeadCell[];
  data: any[];
}

const useTableSort = ({ order, orderBy, setSortState, headCells, data }: Props) => {
  const handleRequestSort = (property: string) => {
    let direction: string | null = 'asc';
    if (property === orderBy) {
      if (order === 'asc') {
        direction = 'desc';
      } else if (order === 'desc') {
        direction = null;
      }
    }
    setSortState({
      order: direction,
      orderBy: property,
    });
  };

  const descendingComparator = (a: any, b: any, sortType: TableSortType) => {
    if (!orderBy || !order) return 0;
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
