import { useState } from 'react';
import { Box, Stack, Typography, useTheme, styled, Skeleton } from '@mui/material';
import { Icons, IconWrapper } from '../../../../../components';
import { useStrings } from '../../hooks/useStrings';
import { useSwapRevamp } from '../../../module/SwapContextProvider';
import { AssetInfoInRow } from '../AssetInfoInRow';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { usePortfolioTokenActivity } from '../../../../portfolio/module/PortfolioTokenActivityProvider';
import { useModal } from '../../../../../components/modals/ModalContext';

const SearchWrapper = styled(Box)({
  position: 'relative',
  height: '40px',
  marginBottom: '8px',
});

const SearchIconWrapper = styled(Box)({
  position: 'absolute',
  left: '7px',
  top: '10px',
  display: 'inline-flex',
});

const SearchInput = styled(Box)({
  border: '2px solid',
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
  },
}) as typeof Box;

const AssetCountText = styled(Typography)({
  marginBottom: '16px',
});

export const SelectAssetTo = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const strings = useStrings();
  const { atoms }: any = useTheme();
  const { swapForm, primaryTokenInfo, tokenInfoList, loadingTokenList } = useSwapRevamp();
  const { closeModal } = useModal();
  const { currency } = useCurrencyPairing();

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const handleAssetClick = (assetId: string) => {
    swapForm.action({ type: 'TokenOutIdChanged', value: assetId });
    swapForm.action({ type: 'TokenOutInputTouched', value: assetId });
    closeModal();
  };

  const filteredAssets =
    tokenInfoList.filter(a => {
      if (a == null) return false;
      if (!searchTerm) return true;
      return `${a.name};[${a.id}];${a.id};${a.fingerprint}`.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  return (
    <Stack {...atoms.mb_2xl}>
      <Stack {...atoms.pb_xl}>
        <SearchWrapper>
          <SearchIconWrapper>
            <IconWrapper icon={Icons.Search} color="ds.el_gray_low" />
          </SearchIconWrapper>
          <SearchInput
            component="input"
            type="text"
            placeholder="Search"
            sx={{
              borderColor: 'ds.el_gray_min',
              backgroundColor: 'ds.bg_color_max',
              color: 'ds.el_gray_low',
              '&:focus': {
                borderColor: 'ds.el_gray_max',
              },
            }}
            onChange={e => {
              setSearchTerm(e.target.value?.trim() ?? '');
            }}
          />
        </SearchWrapper>
        <AssetCountText variant="body2" color="ds.text_gray_low">
          {strings.numYourAssets(tokenInfoList.length)}
        </AssetCountText>
      </Stack>
      <Stack>
        {loadingTokenList ? (
          <Stack gap={16}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                animation="wave"
                variant="rectangular"
                width="100%"
                height={70}
                sx={{ padding: '8px', borderRadius: '8px', backgroundColor: 'ds.gray_100' }}
              />
            ))}
          </Stack>
        ) : (
          filteredAssets.map(asset => {
            return (
              <AssetInfoInRow
                key={asset.id}
                direction="out"
                currency={currency}
                token={{
                  decimals: asset.decimals,
                  name: asset.ticker ?? asset.name,
                  fingerprint: asset.fingerprint,
                  id: asset.id,
                  ...asset,
                }}
                primaryTokenActivity={ptPrice}
                secondaryToken24Activity={data24h && data24h[asset.id]}
                primaryTokenInfo={primaryTokenInfo}
                onAssetClick={() => handleAssetClick(asset.id)}
              />
            );
          })
        )}
      </Stack>
    </Stack>
  );
};
