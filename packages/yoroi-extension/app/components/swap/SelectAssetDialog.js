import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import Dialog from '../widgets/Dialog';

export default function SelectAssetDialog({ assets = [], type, onAssetSelected, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleAssetSelected = asset => {
    onAssetSelected(asset);
    onClose();
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const filteredAssets = assets.filter(
    a =>
      a.name.toLowerCase().includes(searchTerm) ||
      a.ticker.toLowerCase().includes(searchTerm) ||
      a.address.toLowerCase().includes(searchTerm)
  );

  return (
    <Dialog title={type} onClose={onClose} closeOnOverlayClick>
      <Box mb="16px">
        <Box
          component="input"
          type="text"
          placeholder="Search"
          sx={{
            border: '1px solid',
            borderColor: 'grayscale.400',
            borderRadius: '8px',
            padding: '8px',
            paddingLeft: '38px',
            outline: 'none',
            width: '100%',
            '&:focus': {
              borderWidth: '2px',
            },
          }}
          onChange={handleSearch}
        />
      </Box>
      <Box>
        <Typography variant="body2" color="grayscale.700">
          {filteredAssets.length} assets {searchTerm ? 'found' : 'available'}
        </Typography>
      </Box>
      {filteredAssets.length !== 0 && (
        <>
          {type === 'from' && (
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid', py: '13px', pr: '4px' }}
            >
              <Box>Asset</Box>
              <Box>Amount</Box>
            </Box>
          )}
          {type === 'to' && (
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid', py: '13px', pr: '4px' }}
            >
              <Box>Asset</Box>
              <Box>Volume, 24h</Box>
              <Box>Price %, 24h</Box>
            </Box>
          )}
        </>
      )}
      <Box py="8px">
        {filteredAssets.map((a, index) =>
          type === 'from' ? (
            <FromAssetAndAmountRow
              key={`${a.address}-${index}`}
              {...a}
              onAssetSelected={handleAssetSelected}
            />
          ) : (
            <ToAssetAndAmountRow
              key={`${a.address}-${index}`}
              {...a}
              onAssetSelected={handleAssetSelected}
            />
          )
        )}

        {filteredAssets.length === 0 && (
          <Box>
            <Box>
              <NoAssetsFound />
            </Box>
            <Box>No tpkens found for “{searchTerm}”</Box>
          </Box>
        )}
      </Box>
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
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        p: '8px',
        cursor: 'pointer',
        borderRadius: '8px',
        '&:hover': { bgcolor: 'grayscale.50' },
      }}
      onClick={() => onAssetSelected({ name, address, amount, ticker })}
    >
      <Box>{image || <AssetDefault />}</Box>
      <Box flexGrow="1" width="100%">
        <Box>
          <Typography variant="body1">{name}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="grayscale.600">
            {address}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
        <Typography variant="body1" color="grayscale.900">
          <span>{amount}</span>&nbsp;<span>{ticker}</span>
        </Typography>
        {usdAmount && (
          <Typography variant="body2" color="grayscale.600">
            {usdAmount} USD
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const ToAssetAndAmountRow = ({
  image = null,
  name,
  address,
  amount,
  volume24,
  priceChange100,
  ticker,
  usdAmount,
  onAssetSelected,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        p: '8px',
        cursor: 'pointer',
        borderRadius: '8px',
        '&:hover': { bgcolor: 'grayscale.50' },
      }}
      onClick={() => onAssetSelected({ name, address, amount, ticker })}
    >
      <Box>{image || <AssetDefault />}</Box>
      <Box flexGrow="1" width="100%">
        <Box>
          <Typography variant="body1">{name}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="grayscale.600">
            {address}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
        <Typography variant="body1" color="grayscale.900">
          <span>{amount}</span>&nbsp;<span>{ticker}</span>
        </Typography>
        {usdAmount && (
          <Typography variant="body2" color="grayscale.600">
            {usdAmount} USD
          </Typography>
        )}
      </Box>
    </Box>
  );
};
