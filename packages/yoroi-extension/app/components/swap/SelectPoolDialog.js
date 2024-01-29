// @flow
import { Box, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';

const tableColumns = ['DEX name', 'Price', 'TVL', 'DEX fee', 'Liquidity provider fee'];

const templateColumns = 'minmax(auto, 208px) 120px 200px 90px 160px';

type Props = {|
  currentPool: string,
  poolList: Array<any>,
  onPoolSelected(pool: any): void,
  onClose: void => void,
|};

export default function SelectPoolDialog({
  currentPool,
  poolList = [],
  onPoolSelected,
  onClose,
}: Props): React$Node {
  const handlePoolSelected = pool => {
    onPoolSelected(pool);
    onClose();
  };

  return (
    <Dialog title="Select dex" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Table gridTemplateColumns={templateColumns} columnNames={tableColumns}>
        {poolList.map(pool => {
          const { image, name, price, liquidity, fee, deposit } = pool;
          return (
            <Box
              key={name}
              onClick={() => handlePoolSelected(pool)}
              sx={{
                p: '8px',
                display: 'grid',
                gridColumn: '1/-1',
                border: '1px solid',
                borderRadius: '8px',
                cursor: 'pointer',
                alignItems: 'center',
                borderColor: currentPool === name ? 'primary.600' : 'transparent',
                gridTemplateColumns: templateColumns,
                columnGap: '8px',
                '&:hover': { bgcolor: 'grayscale.50' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box width="32px" height="32px">
                  {image}
                </Box>
                <Typography component="span" variant="body1" fontWeight={500}>
                  {name}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {price} ADA
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {liquidity}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {fee}%
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {deposit}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Table>
    </Dialog>
  );
}
