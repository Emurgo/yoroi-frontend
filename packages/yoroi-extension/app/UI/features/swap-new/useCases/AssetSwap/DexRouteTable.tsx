import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { useModal } from '../../../../components/modals/ModalContext';

type DexRoute = {
  id: string;
  logo: string;
  route: string;
  marketPrice: string;
  tvl: string;
  dexFee: string;
  providerFee: string;
}; // TDOO - replace with actual type from your data model

type Props = {
  data: DexRoute[];
};

export const DexRouteTable = ({ data }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(data?.[0]?.id ?? null);
  const { primaryTokenInfo, swapForm } = useSwapRevamp();
  const { closeModal } = useModal();
  const headers = ['Route', 'Market price', 'TVL', 'DEX fee', 'Provider fee'];

  return (
    <TableContainer sx={{ boxShadow: 'none', border: 'none', padding: '2px' }}>
      <Table
        sx={{
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
          tableLayout: 'fixed',
          width: '100%',
          '& thead th': {
            fontWeight: 600,
            borderBottom: '1px solid',
            borderColor: 'ds.gray_200',
          },
          '& td': {
            padding: '8px',
            border: 0,
          },
        }}
      >
        <TableHead>
          <TableRow>
            {headers.map(label => (
              <TableCell key={label}>
                <Typography variant="body2" color="ds.text_gray_low">
                  {label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map(row => {
            const isSelected = row.id === selectedId;
            return (
              <TableRow
                key={row.id}
                x
                onClick={() => {
                  setSelectedId(row.id);
                  swapForm.action({ type: 'ProtocolSelected', value: row.protocol });
                  closeModal()
                }}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  ...(isSelected && {
                    outline: '1px solid',
                    outlineColor: 'ds.primary_500',
                    borderRadius: '8px',
                  }),
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {/* <span>{row.logo}</span> */}
                    <Typography variant="body2">{row.protocol}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {row.finalPrice} {primaryTokenInfo.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.priceImpact}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {row.batcherFee} {primaryTokenInfo.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.fee} %</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
