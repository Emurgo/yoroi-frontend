// @flow
import { Box, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';
import { getMarketPrice } from '@yoroi/swap';
import { Quantities } from '../../utils/quantities';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';

const tableColumns = ['DEX name', 'Price', 'TVL', 'DEX fee', 'Liquidity provider fee'];
const templateColumns = 'minmax(auto, 208px) 120px 200px 90px 160px';
const PRECISION = 10;

type Props = {|
  poolList: Array<any>,
  sellTokenId: string,
  sellTokenInfo: ?RemoteTokenInfo,
  buyTokenInfo: ?RemoteTokenInfo,
  currentPool: string,
  onPoolSelected: (poolId: string) => void,
  onClose: void => void,
|};

export default function SelectPoolDialog({
  currentPool,
  sellTokenId,
  sellTokenInfo,
  buyTokenInfo,
  poolList = [],
  onPoolSelected,
  onClose,
}: Props): React$Node {

  const handlePoolSelected = poolId => {
    onPoolSelected(poolId);
    onClose();
  };

  // <TODO:SWAP_FIX> unhardcode ada ticker

  const isTokenInfoPresent = sellTokenInfo != null && buyTokenInfo != null;
  const denomination = (sellTokenInfo?.decimals ?? 0) - (buyTokenInfo?.decimals ?? 0);

  return (
    <Dialog title="Select dex" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Table gridTemplateColumns={templateColumns} columnNames={tableColumns}>
        {poolList.map(pool => {
          const { provider, fee, deposit, poolId } = pool;
          const marketPrice = getMarketPrice(pool, sellTokenId);
          const formattedMarketPrice = isTokenInfoPresent ? Quantities.format(
            marketPrice ?? Quantities.zero,
            denomination,
            PRECISION,
          ) : '-';
          return (
            <Box
              key={poolId}
              onClick={() => handlePoolSelected(poolId)}
              sx={{
                p: '8px',
                display: 'grid',
                gridColumn: '1/-1',
                border: '1px solid',
                borderRadius: '8px',
                cursor: 'pointer',
                alignItems: 'center',
                borderColor: currentPool === poolId ? 'primary.600' : 'transparent',
                gridTemplateColumns: templateColumns,
                columnGap: '8px',
                '&:hover': { bgcolor: 'grayscale.50' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box width="32px" height="32px">
                  todo:image
                </Box>
                <Typography component="span" variant="body1" fontWeight={500}>
                  {provider}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {formattedMarketPrice}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  todo:liquidity
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {fee}%
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {deposit.quantity/1_000_000} ADA
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Table>
    </Dialog>
  );
}
