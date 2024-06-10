// @flow
import type { AssetAmount, PriceImpact } from './types';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import { ReactComponent as SearchIcon } from '../../assets/images/revamp/icons/search.inline.svg';
import { ReactComponent as WalletIcon } from '../../assets/images/revamp/icons/wallet.inline.svg';
import { ReactComponent as ArrowTopIcon } from '../../assets/images/revamp/icons/arrow-top.inline.svg';
import { ReactComponent as ArrowBottomIcon } from '../../assets/images/revamp/icons/arrow-bottom.inline.svg';
import { truncateAddressShort } from '../../utils/formatters';
import adaTokenImage from '../../assets/images/ada.inline.svg';
import defaultTokenImage from '../../assets/images/revamp/asset-default.inline.svg';
import Dialog from '../widgets/Dialog';
import Table from '../common/table/Table';
import { urlResolveForIpfsAndCorsproxy } from '../../coreUtils';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { PriceImpactColored, PriceImpactIcon } from './PriceImpact';
import { InfoTooltip } from '../widgets/InfoTooltip';

const fromTemplateColumns = '1fr minmax(auto, 136px)';
const toTemplateColumns = '1fr minmax(auto, 152px) minmax(auto, 136px)';
const fromColumns = ['Asset', 'Amount'];
const toColumns = [];

type Props = {|
  assets: Array<AssetAmount>,
  type: 'from' | 'to',
  onAssetSelected: any => void,
  onClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
|};

export default function SelectAssetDialog({
  assets = [],
  type,
  onAssetSelected,
  onClose,
  defaultTokenInfo,
  getTokenInfo,
}: Props): React$Node {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAssetSelected = asset => {
    onAssetSelected(asset);
    onClose();
  };

  const filteredAssets =
    assets.filter(a => {
      if (a == null) return false;
      if (!searchTerm) return true;
      return `${a.name};[${a.ticker}];${a.id};${a.fingerprint}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }) || [];

  return (
    <Dialog
      title={`Swap ${type}`}
      onClose={onClose}
      withCloseButton
      closeOnOverlayClick
      styleOverride={{ minWidth: '612px', maxWidth: '612px', minHeight: '600px' }}
      styleContentOverride={{ paddingTop: '16px' }}
      scrollableContentClass="scrollable-content"
    >
      <Box mb="8px" position="relative" height="40px">
        <Box
          sx={{
            position: 'absolute',
            left: '7px',
            top: '30px',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            color: 'grayscale.600',
            height: '40px',
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
            fontSize: '14px',
            fontFamily: 'Rubik',
            height: '40px',
            '&:focus': {
              borderWidth: '2px',
              borderColor: 'grayscale.max',
            },
          }}
          onChange={e => {
            setSearchTerm(e.target.value?.trim() ?? '');
          }}
        />
      </Box>
      <Box>
        <Typography component="div" variant="body2" color="grayscale.700">
          {filteredAssets.length} assets {searchTerm ? 'found' : 'available'}
        </Typography>
      </Box>

      {filteredAssets.length !== 0 && (
        <Table
          rowGap="0px"
          columnNames={type === 'from' ? fromColumns : toColumns}
          gridTemplateColumns={type === 'from' ? fromTemplateColumns : toTemplateColumns}
        >
          {filteredAssets.map(a => {
            return (
              <AssetAndAmountRow
                key={a.id}
                asset={a}
                type={type}
                onAssetSelected={handleAssetSelected}
                defaultTokenInfo={defaultTokenInfo}
                getTokenInfo={getTokenInfo}
              />
            );
          })}
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
            <Typography component="div" variant="body1" fontWeight={500}>
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

export const AssetAndAmountRow = ({
  type,
  asset,
  usdPrice = null,
  adaPrice = null,
  volume24h = null,
  priceChange100 = '',
  onAssetSelected = null,
  defaultTokenInfo,
  getTokenInfo,
  displayAmount = null,
  priceImpactState = null,
}: {|
  type: 'from' | 'to',
  asset: AssetAmount,
  usdPrice?: number,
  adaPrice?: number,
  volume24h?: number,
  priceChange100?: string,
  onAssetSelected?: AssetAmount => void,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
  displayAmount?: ?string,
  priceImpactState?: ?PriceImpact,
|}): React$Node => {

  const [remoteTokenLogo, setRemoteTokenLogo] = useState<?string>(null);

  const isFrom = type === 'from';

  const { name = null, image = '', fingerprint: address, id, amount: assetAmount, ticker } = asset;
  const priceNotChanged = Number(priceChange100.replace('-', '').replace('%', '')) === 0;
  const priceIncreased = priceChange100 && priceChange100.charAt(0) !== '-';
  const priceChange24h = priceChange100.replace('-', '') || '0%';

  useEffect(() => {
    if (id != null) {
      getTokenInfo(id).then(tokenInfo => {
        if (tokenInfo.logo != null) {
          setRemoteTokenLogo(`data:image/png;base64,${tokenInfo.logo}`);
        }
        return null;
      }).catch(e => {
        console.warn('Failed to resolve remote info for token: ' + id, e);
      });
    }
  }, [id])

  const imgSrc =
    ticker === defaultTokenInfo.ticker
      ? adaTokenImage
      : remoteTokenLogo ?? urlResolveForIpfsAndCorsproxy(image) ?? defaultTokenImage;

  const amount = displayAmount ?? assetAmount;

  const priceColor = (): string => {
    if (priceNotChanged) return 'grayscale.900';
    if (priceIncreased) return 'secondary.600';
    return 'magenta.500';
  };

  const isClickable = onAssetSelected != null;

  return (
    <Box
      sx={{
        display: 'grid',
        columnGap: '8px',
        p: '8px',
        borderRadius: '8px',
        gridColumn: '1/-1',
        gridTemplateColumns: isFrom ? fromTemplateColumns : toTemplateColumns,
        ...(isClickable
          ? {
              '&:hover': { bgcolor: 'grayscale.50' },
              cursor: 'pointer',
            }
          : {}),
      }}
      {...(isClickable ? { onClick: () => onAssetSelected?.(asset) } : {})}
    >
      <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          width="48px"
          height="48px"
          overflow="hidden"
          flexShrink="0"
          borderRadius="8px"
        >
          <img
            width="100%"
            src={imgSrc}
            alt={name}
            onError={e => {
              e.target.src = defaultTokenImage;
            }}
          />
        </Box>
        <Box flexGrow="1" width="100%">
          <Box display="flex" alignItems="center" gap="8px">
            <Typography component="div" fontWeight={500} variant="body1">
              {(name !== address || name !== id) && name !== ticker && `[${ticker}]`} {name}
            </Typography>
            {!isFrom && amount != null && (
              <InfoTooltip content={'This asset is already in my portfolio'}>
                <Box component="span" color="secondary.600">
                  <WalletIcon />
                </Box>
              </InfoTooltip>
            )}
          </Box>
          <Box>
            <Typography component="div" variant="body2" color="grayscale.600">
              {truncateAddressShort(address || id, 17) || 'Cardano'}
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
              <Typography component="div" variant="body1" color="grayscale.900">
                <span>{volume24h}</span>&nbsp;<span>{ticker}</span>
              </Typography>
              {adaPrice && volume24h && (
                <Typography component="div" variant="body2" color="grayscale.600">
                  {(volume24h * adaPrice).toFixed(2)} ADA
                </Typography>
              )}
            </Box>
          ) : null}
          {priceChange100 && (
            <Box
              alignSelf="center"
              p="16px"
              color={priceColor()}
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
          <Typography component="div" variant="body1" color="grayscale.900" display="flex">
            {priceImpactState && <PriceImpactIcon isSevere={priceImpactState.isSevere} />}
            <PriceImpactColored priceImpactState={priceImpactState}>
              <span>{amount}</span>&nbsp;<span>{ticker}</span>
            </PriceImpactColored>
          </Typography>
          {usdPrice && (
            <Typography component="div" variant="body2" color="grayscale.600">
              {(Number(amount) * usdPrice).toFixed(2)} USD
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
