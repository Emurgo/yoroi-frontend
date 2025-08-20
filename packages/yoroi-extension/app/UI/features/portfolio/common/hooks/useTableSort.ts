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
  const defaultSortDirections: Record<string, 'asc' | 'desc'> = {
    price: 'desc',
    totalAmount: 'desc',
    portfolio: 'asc',
    '24h': 'desc',
    '1W': 'desc',
    '1M': 'desc',
  };

  const compareValues = (a: any, b: any, sortType: TableSortType, sortOrder: 'asc' | 'desc', sortKey: string): number => {
    const isInvalid = (val: any) => isNaN(Number(val)) || Number(val) === 0;

    if (['price', 'portfolio', 'totalAmount', '24h', '1W', '1M'].includes(sortKey)) {
      const aInvalid = isInvalid(a[sortKey]);
      const bInvalid = isInvalid(b[sortKey]);

      if (aInvalid && !bInvalid) return 1;
      if (!aInvalid && bInvalid) return -1;
      if (aInvalid && bInvalid) return 0;
    }

    let comparison = 0;

    switch (sortType) {
      case 'numeric': {
        const aValue = Number(a[sortKey]);
        const bValue = Number(b[sortKey]);
        comparison = aValue === bValue ? 0 : aValue < bValue ? -1 : 1;
        break;
      }
      case 'character': {
        const aName = String(a.info?.[sortKey] ?? '');
        const bName = String(b.info?.[sortKey] ?? '');

        const startsWithSymbolOrNumber = (str: string) => /^[^a-zA-Z]/.test(str);

        const aIsWeird = startsWithSymbolOrNumber(aName);
        const bIsWeird = startsWithSymbolOrNumber(bName);

        if (aIsWeird && !bIsWeird) return 1;
        if (!aIsWeird && bIsWeird) return -1;

        comparison = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        break;
      }
      default: {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        comparison = aVal === bVal ? 0 : aVal < bVal ? -1 : 1;
      }
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  };

  const sortArray = (arr: any[], sortKey: string, sortOrder: 'asc' | 'desc'): any[] => {
    const sortColumn = headCells.find(cell => cell.id === sortKey);
    const sortType = sortColumn?.sortType ?? 'character';

    return [...arr].sort((a, b) => compareValues(a, b, sortType, sortOrder, sortKey));
  };

  const handleRequestSort = (property: string) => {
    const defaultDirection = defaultSortDirections[property] ?? 'asc';
    const newOrder = property !== orderBy ? defaultDirection : order === 'asc' ? 'desc' : 'asc';

    setSortState({ order: newOrder, orderBy: property });
  };

  const getSortedData = React.useCallback(
    (arr: any[]) => {
      if (!orderBy || !order) return data;
      return sortArray(arr, orderBy, order);
    },
    [order, orderBy, headCells, data]
  );

  return { getSortedData, handleRequestSort };
};

export default useTableSort;
