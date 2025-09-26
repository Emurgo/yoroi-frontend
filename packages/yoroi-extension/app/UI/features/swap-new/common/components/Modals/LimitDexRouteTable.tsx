import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';
import { SwapActionType, useSwapRevamp } from '../../../module/SwapContextProvider';
import { useModal } from '../../../../../components/modals/ModalContext';
import { useStrings } from '../../hooks/useStrings';

export const LimitDexRouteTable = () => {
  const strings = useStrings();
  const { primaryTokenInfo, swapForm, limitOptions } = useSwapRevamp();
  const { closeModal } = useModal();
  const headers = [strings.routeLabel, strings.routeTvl, strings.dexFee];

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
          {limitOptions?.options.map((row, index) => {
            const isSelected = row.protocol === swapForm.selectedProtocol.value;
            return (
              <TableRow
                key={index}
                onClick={() => {
                  swapForm.action({ type: SwapActionType.ProtocolSelected, value: row.protocol });
                  closeModal();
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
                    <Typography variant="body2">{row.protocol}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{row.initialPrice}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {row.batcherFee} {primaryTokenInfo.name}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
