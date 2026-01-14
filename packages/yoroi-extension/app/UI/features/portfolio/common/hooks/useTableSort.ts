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
    name: 'desc',
    price: 'desc',
    totalAmount: 'desc',
    portfolioPercentage: 'desc',
    '24h': 'desc',
    '1W': 'desc',
    '1M': 'desc',
  };

  const _compAB = (valueA: string | number, valueB: string | number) => {
    if (valueA === valueB) return 0;
    return valueA < valueB ? -1 : 1;
  };

  const _checkForWeirdSymbols = (tokenAName: string, tokenBName: string) => {
    const startsWithSymbolOrNumber = (str: string) => /^[^a-zA-Z]/.test(str);

    const aIsWeird = startsWithSymbolOrNumber(tokenAName);
    const bIsWeird = startsWithSymbolOrNumber(tokenBName);

    if (aIsWeird && !bIsWeird) return 1;
    if (!aIsWeird && bIsWeird) return -1;
    return undefined;
  };

  const compareValues = (a: any, b: any, sortType: TableSortType, sortOrder: 'asc' | 'desc', sortKey: string): number => {
    const isInvalid = (val: any) => Number.isNaN(Number(val));
    const valueA = a[sortKey];
    const valueB = b[sortKey];

    if (['price', 'portfolioPercentage', 'totalAmount', '24h', '1W', '1M'].includes(sortKey)) {
      const aInvalid = isInvalid(valueA);
      const bInvalid = isInvalid(valueB);

      if (aInvalid && !bInvalid) return 1;
      if (!aInvalid && bInvalid) return -1;
      if (aInvalid && bInvalid) return 0;
    }

    let comparison = 0;

    switch (sortType) {
      case 'numeric': {
        comparison = _compAB(Number(valueA), Number(valueB));
        break;
      }
      case 'character': {
        const aName = String(a.info?.[sortKey] ?? '');
        const bName = String(b.info?.[sortKey] ?? '');

        const checkResult = _checkForWeirdSymbols(aName, bName);
        if (checkResult) return checkResult;

        comparison = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
        break;
      }
      default: {
        comparison = _compAB(valueA, valueB);
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
    let newOrder: 'asc' | 'desc';
    if (property === orderBy) {
      newOrder = order === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = defaultDirection;
    }

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
