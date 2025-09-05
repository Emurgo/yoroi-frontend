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
      id="portfolio:statTable-assetsList-tableHead"
      sx={{
        '& .MuiTableCell-head': {
          borderBottom: '1px solid',
          borderColor: 'ds.gray_200',
        },
      }}
    >
      <TableRow id="portfolio:statTable-assetsList-tableHeadRow">
        {headCells.map(({ label, align, id, isPadding, disabledSort }) => {
          return (
            <TableCell
              key={id}
              align={align}
              id={`portfolio:statTable:${id}Column-${id}Header-cell`}
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
                  id={`portfolio:statTable:${id}Column-${id}HeaderText-text`}
                  sx={{ userSelect: 'none' }}
                >
                  {label}
                </Typography>
                {disabledSort ? null : (
                  <SortIcon
                    id={`portfolio:statTable:${id}Column-${id}SortIcon-icon`}
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
