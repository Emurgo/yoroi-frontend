import React from 'react';
import { TableHead, TableRow, TableCell, Stack, Typography } from '@mui/material';
import { Sort as SortIcon } from '../../../../components/icons/Sort';
import { useTheme } from '@mui/material/styles';
import { IHeadCell } from '../types/table';

interface Props {
  headCells: IHeadCell[];
  order: string | null;
  orderBy: string | null;
  onRequestSort: (id: string) => void;
}

const SortableTableHead = ({ headCells, order, orderBy, onRequestSort }: Props): JSX.Element => {
  const theme = useTheme();

  return (
    <TableHead>
      <TableRow>
        {headCells.map(({ label, align, id, isPadding, disabledSort }) => {
          return (
            <TableCell key={id} align={align} sx={{ padding: `11.8px ${theme.spacing(2)}` }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                onClick={() => (isPadding ? null : disabledSort ? null : onRequestSort(id))}
                // @ts-ignore
                sx={{
                  float: align,
                  cursor: isPadding || disabledSort ? 'normal' : 'pointer',
                  justifyContent: isPadding ? 'space-between' : 'flex-start',
                  width: isPadding ? '100%' : 'fit-content',
                }}
              >
                <Typography variant="body2" color="ds.gray_600" sx={{ userSelect: 'none' }}>
                  {label}
                </Typography>
                {disabledSort ? null : (
                  <SortIcon
                    id={id}
                    order={order}
                    orderBy={orderBy}
                    style={{ cursor: 'pointer' }}
                    onClick={() => (isPadding ? onRequestSort(id) : null)}
                  />
                )}
              </Stack>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
