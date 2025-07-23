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
    portfolioPercents: 'asc',
    '24h': 'desc',
    '1W': 'desc',
    '1M': 'desc',
  };

  const handleRequestSort = (property: string) => {
    const defaultDirection = defaultSortDirections[property] ?? 'asc';
    const direction = property !== orderBy ? defaultDirection : order === 'asc' ? 'desc' : 'asc';
    setSortState({ order: direction, orderBy: property });
  };

  const compareValues = (a: any, b: any, sortType: TableSortType): number => {
    if (!orderBy) return 0;

    const isInvalid = (val: any) => isNaN(Number(val)) || Number(val) === 0;

    if (['price', 'portfolioPercents', 'totalAmount', '24h', '1W', '1M'].includes(orderBy)) {
      const aInvalid = isInvalid(a[orderBy]);
      const bInvalid = isInvalid(b[orderBy]);

      if (aInvalid && !bInvalid) return 1;
      if (!aInvalid && bInvalid) return -1;
      if (aInvalid && bInvalid) return 0;
    }

    let comparison = 0;

    switch (sortType) {
      case 'numeric': {
        const aValue = Number(a[orderBy]);
        const bValue = Number(b[orderBy]);
        comparison = aValue === bValue ? 0 : aValue < bValue ? -1 : 1;
        break;
      }
      case 'character': {
        const aName = String(a.info[orderBy] ?? '');
        const bName = String(b.info[orderBy] ?? '');

        const startsWithSymbolOrNumber = (str: string) => /^[^a-zA-Z]/.test(str);

        const aIsWeird = startsWithSymbolOrNumber(aName);
        const bIsWeird = startsWithSymbolOrNumber(bName);

        if (aIsWeird && !bIsWeird) return 1;
        if (!aIsWeird && bIsWeird) return -1;

        comparison = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        break;
      }
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
