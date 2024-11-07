import React from 'react';
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
        direction = 'asc';
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
        const aValue = Number(a[orderBy]);
        const bValue = Number(b[orderBy]);
        return bValue === aValue ? 0 : bValue < aValue ? -1 : 1;
      case 'character':
        return String(a.info[orderBy]).localeCompare(b.info[orderBy]);
      default:
        return b[orderBy] === a[orderBy] ? 0 : b[orderBy] < a[orderBy] ? -1 : 1;
    }
  };

  const getSortedData = React.useCallback(
    (arr: any[]) => {
      if (!orderBy || !order) return data;
      const sortColumn = headCells.find(cell => cell.id === orderBy);
      const sortType = sortColumn?.sortType ?? 'character';
      return [...arr].sort((a, b) => {
        return order === 'desc' ? descendingComparator(a, b, sortType) : -descendingComparator(a, b, sortType);
      });
    },
    [order, orderBy, headCells, data]
  );

  return { getSortedData, handleRequestSort };
};

export default useTableSort;
