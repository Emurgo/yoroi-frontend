import { Box } from '@mui/material';
import Dialog from '../widgets/Dialog';

export default function SelectAssetDialog({ assets = [], type, onAssetSelected, onClose }) {
  return (
    <Dialog title={type} onClose={onClose} closeOnOverlayClick>
      Local Search here
      <hr />
      {assets.map((a, index) =>
        type === 'from' ? (
          <FromAssetAndAmountRow
            key={`${a.address}-${index}`}
            {...a}
            onAssetSelected={onAssetSelected}
          />
        ) : (
          <ToAssetAndAmountRow
            key={`${a.address}-${index}`}
            {...a}
            onAssetSelected={onAssetSelected}
          />
        )
      )}
    </Dialog>
  );
}

const FromAssetAndAmountRow = ({
  image = null,
  name,
  address,
  amount,
  ticker,
  usdAmount,
  onAssetSelected,
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      onClick={() => onAssetSelected({ name, address, amount, ticker })}
    >
      <Box>{image}</Box>
      <Box flexGrow="1" flexShrink="0" width="100%">
        {name}
      </Box>
      <Box>
        <Box>
          {amount} {ticker}
        </Box>
        {usdAmount && <Box>{usdAmount} USD</Box>}
      </Box>
    </Box>
  );
};

const ToAssetAndAmountRow = ({
  image = null,
  name,
  address,
  amount,
  ticker,
  usdAmount,
  onAssetSelected,
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      onClick={() => onAssetSelected({ name, address, amount, ticker })}
    >
      <Box>{image}</Box>
      <Box flexGrow="1" flexShrink="0" width="100%">
        {name}
      </Box>
      <Box>
        <Box>
          {amount} {ticker}
        </Box>
        {usdAmount && <Box>{usdAmount}</Box>}
      </Box>
    </Box>
  );
};
