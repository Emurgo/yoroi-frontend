import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import { ReactComponent as SearchIcon } from '../../assets/images/revamp/icons/search.inline.svg';
import { truncateAddressShort } from '../../utils/formatters';
import Dialog from '../widgets/Dialog';

export default function SelectAssetDialog({ assets = [], type, onAssetSelected, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleSortBy = sort => {
    setSortBy(sort);
  };

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
      <Box mb="16px" position="relative">
        <Box
          sx={{
            position: 'absolute',
            left: '7px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
          }}
        >
          <SearchIcon />
        </Box>
        <Box
          component="input"
          type="text"
          placeholder="Search"
          sx={{
            border: '1px solid',
            borderColor: 'grayscale.400',
            borderRadius: '8px',
            padding: '8px',
            paddingLeft: '34px',
            outline: 'none',
            width: '100%',
            '&:focus': {
              borderWidth: '2px',
              borderColor: 'grayscale.max',
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
              sx={{
                borderBottom: '1px solid',
                borderColor: 'grayscale.200',
                color: 'grayscale.600',
                py: '13px',
                pr: '4px',
              }}
            >
              <Box>
                <Typography variant="body2">Asset</Typography>
              </Box>
              <Box>
                <Typography variant="body2">Amount</Typography>
              </Box>
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
          <Box
            display="flex"
            flexDirection="column"
            gap="16px"
            alignItems="center"
            justifyContent="center"
          >
            <Box mt="60px">
              <NoAssetsFound />
            </Box>
            <Typography variant="body1" fontWeight={500}>
              No tpkens found for “{searchTerm}”
            </Typography>
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
  walletAmount,
  ticker,
  usdPrice,
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
      onClick={() => onAssetSelected({ name, address, walletAmount, ticker })}
    >
      <Box>{image || <AssetDefault />}</Box>
      <Box flexGrow="1" width="100%">
        <Box>
          <Typography variant="body1">{name}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="grayscale.600">
            {truncateAddressShort(address, 17)}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink="0" display="flex" flexDirection="column" alignItems="flex-end">
        <Typography variant="body1" color="grayscale.900">
          <span>{walletAmount}</span>&nbsp;<span>{ticker}</span>
        </Typography>
        {usdPrice && (
          <Typography variant="body2" color="grayscale.600">
            {(walletAmount * usdPrice).toFixed(2)} USD
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
            {truncateAddressShort(address, 17)}
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
