import { Stack, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Sort as SortIcon } from '../../../../components/icons/Sort';
import { IHeadCell } from '../types/table';

interface Props {
  headCells: IHeadCell[];
  order: string | null;
  orderBy: string | null;
  onRequestSort: (id: string) => void;
}

const SortableTableHead = ({ headCells, order, orderBy, onRequestSort }: Props): React.ReactNode => {
  const theme = useTheme();

  return (
    <TableHead
      id="portfolio-table-head"
      sx={{
        '& .MuiTableCell-head': {
          borderBottom: '1px solid',
          borderColor: 'ds.gray_200',
        },
      }}
    >
      <TableRow id="portfolio-table-head-row">
        {headCells.map(({ label, align, id, isPadding, disabledSort }) => {
          return (
            <TableCell 
              key={id} 
              align={align} 
              id={`portfolio-table-header-${id}`}
              sx={{ padding: `11.8px ${theme.spacing(16)}` }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(8)}
                onClick={() => (isPadding ? null : disabledSort ? null : onRequestSort(id))}
                // @ts-ignore
                sx={{
                  float: align,
                  cursor: isPadding || disabledSort ? 'normal' : 'pointer',
                  justifyContent: isPadding ? 'space-between' : 'flex-start',
                  width: isPadding ? '100%' : 'fit-content',
                }}
              >
                <Typography 
                  variant="body2" 
                  color="ds.gray_600" 
                  id={`portfolio-table-header-text-${id}`}
                  sx={{ userSelect: 'none' }}
                >
                  {label}
                </Typography>
                {disabledSort ? null : (
                  <SortIcon
                    id={`portfolio-table-sort-icon-${id}`}
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
