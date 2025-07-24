import React from 'react';
import { IHeadCell, TableSortType } from '../types/table';

export interface ISortState {
  order: 'asc' | 'desc' | null;
  orderBy: string | null;
}

interface Props {
  order: 'asc' | 'desc' | null;
  orderBy: string | null;
  setSortState: React.Dispatch<React.SetStateAction<ISortState>>;
  headCells: IHeadCell[];
  data: any[];
}

const useTableSort = ({ order, orderBy, setSortState, headCells, data }: Props) => {
  const handleRequestSort = (property: string) => {
    const sortColumn = headCells.find(cell => cell.id === property);
    const isNumeric = sortColumn?.sortType === 'numeric';

    const direction = property !== orderBy ? (isNumeric ? 'desc' : 'asc') : order === 'asc' ? 'desc' : 'asc';

    setSortState({ order: direction, orderBy: property });
  };

  const compareValues = (a: any, b: any, sortType: TableSortType): number => {
    if (!orderBy) return 0;

    if (orderBy === 'price') {
      const aPrice = Number(a.price);
      const bPrice = Number(b.price);

      if (aPrice === 0 && bPrice === 0) return 0;
      if (aPrice === 0) return 1;
      if (bPrice === 0) return -1;
    }

    let comparison = 0;

    switch (sortType) {
      case 'numeric': {
        const aValue = Number(a[orderBy]);
        const bValue = Number(b[orderBy]);
        comparison = aValue === bValue ? 0 : aValue < bValue ? -1 : 1;
        break;
      }
      case 'character':
        comparison = String(a.info[orderBy]).localeCompare(String(b.info[orderBy]));
        break;
      default:
        comparison = a[orderBy] === b[orderBy] ? 0 : a[orderBy] < b[orderBy] ? -1 : 1;
    }

    return order === 'desc' ? -comparison : comparison;
  };

  const getSortedData = React.useCallback(
    (arr: any[]) => {
      if (!orderBy || !order) return data;
      const sortColumn = headCells.find(cell => cell.id === orderBy);
      const sortType = sortColumn?.sortType ?? 'character';

      return [...arr].sort((a, b) => compareValues(a, b, sortType));
    },
    [order, orderBy, headCells, data]
  );

  return { getSortedData, handleRequestSort };
};

export default useTableSort;
