import { Box, Stack, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Icons, IconWrapper } from '../../../../components';
import { useStrings } from '../hooks/useStrings';
import { AssetInfoInRow } from './AssetInfoInRow';

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
        <Box mb="8px" position="relative" height="40px">
          <Box
            sx={{
              position: 'absolute',
              left: '7px',
              top: '10px',
              display: 'inline-flex',
            }}
          >
            <IconWrapper icon={Icons.Search} color="ds.el_gray_low" />
          </Box>
          <Box
            component="input"
            type="text"
            placeholder="Search"
            sx={{
              border: '2px solid',
              borderColor: 'ds.el_gray_min',
              borderRadius: '8px',
              padding: '8px',
              paddingLeft: '34px',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              fontFamily: 'Rubik',
              height: '40px',
              backgroundColor: 'ds.bg_color_max',
              color: 'ds.el_gray_low',
              '&:focus': {
                borderWidth: '2px',
                borderColor: 'ds.el_gray_max',
              },
            }}
            onChange={e => {
              setSearchTerm(e.target.value?.trim() ?? '');
            }}
          />
        </Box>
        <Box sx={{ marginBottom: '16px' }}>
          <Typography component="div" variant="body2" color="ds.text_gray_low">
            {strings.numYourAssets(filteredAssets.length)}
          </Typography>
        </Box>
      </Stack>

      <AssetInfoInRow />
    </Stack>
  );
};
