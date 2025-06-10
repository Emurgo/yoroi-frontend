import { useState } from 'react';
import { Box, Stack, Typography, useTheme, styled } from '@mui/material';
import { Icons, IconWrapper } from '../../../../components';
import { useStrings } from '../hooks/useStrings';
import { AssetInfoInRow } from './AssetInfoInRow';

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

export const SelectAssetModalContent = ({ assets = [] }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const strings = useStrings();
  const { atoms }: any = useTheme();

  const filteredAssets =
    assets.filter(a => {
      if (a == null) return false;
      if (!searchTerm) return true;
      return `${a.name};[${a.ticker}];${a.id};${a.fingerprint}`.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  return (
    <Stack>
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
          {strings.numYourAssets(filteredAssets.length)}
        </AssetCountText>
      </Stack>

      <AssetInfoInRow />
    </Stack>
  );
};
