import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import { ReactComponent as SearchIcon } from '../../assets/images/revamp/icons/search.inline.svg';
import { ReactComponent as WalletIcon } from '../../assets/images/revamp/icons/wallet.inline.svg';
import { ReactComponent as ArrowTopIcon } from '../../assets/images/revamp/icons/arrow-top.inline.svg';
import { ReactComponent as ArrowBottomIcon } from '../../assets/images/revamp/icons/arrow-bottom.inline.svg';
import { truncateAddressShort } from '../../utils/formatters';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';

const fromTemplateColumns = '1fr minmax(auto, 136px)';
const toTemplateColumns = '1fr minmax(auto, 152px) minmax(auto, 136px)';
// TODO: add Intl
const fromColumns = ['Asset', 'Amount'];
const toColumns = ['Asset', 'Volume, 24h', 'Price %, 24h'];

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
    <Dialog title={`Swap ${type}`} onClose={onClose} withCloseButton closeOnOverlayClick>
      <Box mb="8px" position="relative">
        <Box
          sx={{
            position: 'absolute',
            left: '7px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            color: 'grayscale.600',
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
        <Table
          rowGap="0px"
          columnNames={type === 'from' ? fromColumns : toColumns}
          gridTemplateColumns={type === 'from' ? fromTemplateColumns : toTemplateColumns}
        >
          {filteredAssets.map((a, index) => (
            <AssetAndAmountRow
              key={`${a.address}-${index}`}
              {...a}
              type={type}
              onAssetSelected={handleAssetSelected}
            />
          ))}
        </Table>
      )}
      {filteredAssets.length === 0 && (
        <Box py="8px">
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
              {type === 'from'
                ? `No tokens found for “${searchTerm}”`
                : 'No asset was found to swap'}
            </Typography>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

const AssetAndAmountRow = ({
  image = null,
  type,
  name,
  address,
  walletAmount,
  ticker,
  usdPrice,
  adaPrice,
  volume24h,
  priceChange100 = '',
  onAssetSelected,
}) => {
  const isFrom = type === 'from';
  const priceNotChanged = Number(priceChange100.replace('-', '').replace('%', '')) === 0;
  const priceIncreased = priceChange100 && priceChange100.charAt(0) !== '-';
  const priceChange24h = priceChange100.replace('-', '') || '0%';

  return (
    <Box
      sx={{
        display: 'grid',
        columnGap: '8px',
        p: '8px',
        cursor: 'pointer',
        borderRadius: '8px',
        gridColumn: '1/-1',
        gridTemplateColumns: isFrom ? fromTemplateColumns : toTemplateColumns,
        '&:hover': { bgcolor: 'grayscale.50' },
      }}
      onClick={() => onAssetSelected({ address, ticker })}
    >
      <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Box display="inline-flex">{image || <AssetDefault />}</Box>
        <Box flexGrow="1" width="100%">
          <Box display="flex" alignItems="center" gap="8px">
            <Typography fontWeight={500} variant="body1">
              {name !== address && `[${ticker}]`} {name}
            </Typography>
            {!isFrom && walletAmount > 0 && (
              <Box component="span" color="secondary.600">
                <WalletIcon />
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="body2" color="grayscale.600">
              {truncateAddressShort(address, 17)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {!isFrom && (
        <>
          {volume24h ? (
            <Box
              alignSelf="center"
              flexShrink="0"
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
            >
              <Typography variant="body1" color="grayscale.900">
                <span>{volume24h}</span>&nbsp;<span>{ticker}</span>
              </Typography>
              {adaPrice && volume24h && (
                <Typography variant="body2" color="grayscale.600">
                  {(volume24h * adaPrice).toFixed(2)} ADA
                </Typography>
              )}
            </Box>
          ) : null}
          {priceChange100 && (
            <Box
              alignSelf="center"
              p="16px"
              color={
                priceNotChanged ? 'grayscale.900' : priceIncreased ? 'secondary.600' : 'magenta.500'
              }
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              gap="8px"
            >
              {!priceNotChanged && (
                <Box>{priceIncreased ? <ArrowTopIcon /> : <ArrowBottomIcon />}</Box>
              )}
              <Box>{priceChange24h}</Box>
            </Box>
          )}
        </>
      )}

      {isFrom && (
        <Box
          alignSelf="center"
          flexShrink="0"
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
        >
          <Typography variant="body1" color="grayscale.900">
            <span>{walletAmount}</span>&nbsp;<span>{ticker}</span>
          </Typography>
          {usdPrice && (
            <Typography variant="body2" color="grayscale.600">
              {(walletAmount * usdPrice).toFixed(2)} USD
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
