// @flow
import { Box, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';
import { getMarketPrice } from '@yoroi/swap';
import { Quantities } from '../../utils/quantities';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { SwapPoolIcon } from './SwapPoolComponents';
import BigNumber from 'bignumber.js';

const tableColumns = ['DEX name', 'Price', 'TVL', 'DEX fee', 'Liquidity provider fee'];
const templateColumns = 'minmax(auto, 208px) 120px 200px 90px 160px';
const PRECISION = 10;

type Props = {|
  poolList: Array<*>,
  sellTokenId: string,
  denomination: number,
  defaultTokenInfo: RemoteTokenInfo,
  currentPool: string,
  onPoolSelected: (poolId: string) => void,
  onClose: void => void,
|};

export default function SelectPoolDialog({
  currentPool,
  sellTokenId,
  denomination,
  defaultTokenInfo,
  poolList = [],
  onPoolSelected,
  onClose,
}: Props): React$Node {

  const handlePoolSelected = poolId => {
    onPoolSelected(poolId);
    onClose();
  };

  const ptDecimals = defaultTokenInfo.decimals ?? 0;
  const ptTicker = defaultTokenInfo.ticker;

  return (
    <Dialog title="Select dex" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Table gridTemplateColumns={templateColumns} columnNames={tableColumns}>
        {poolList.map(pool => {
          const { provider, fee, batcherFee, poolId } = pool;
          const tvl = new BigNumber(pool.tokenA.quantity)
            .dividedBy(pool.ptPriceTokenA)
            .multipliedBy(2)
            .toString(10);
          const formattedTvl = Quantities.format(tvl, ptDecimals, 0);
          const marketPrice = getMarketPrice(pool, sellTokenId);
          const formattedMarketPrice = denomination >= 0 ? Quantities.format(
            marketPrice ?? Quantities.zero,
            denomination,
            PRECISION,
          ) : '-';
          const formattedPoolFee = Quantities
            .format(batcherFee.quantity, ptDecimals, ptDecimals);
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
                  <SwapPoolIcon provider={provider} />
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
                  {formattedTvl} {ptTicker}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {formattedPoolFee} {ptTicker}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography component="span" variant="body1">
                  {fee}%
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Table>
    </Dialog>
  );
}
