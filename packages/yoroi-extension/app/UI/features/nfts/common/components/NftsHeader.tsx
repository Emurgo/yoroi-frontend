import { InputAdornment } from '@mui/material';
import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { SearchInput } from '../../../../components/Input/SearchInput';
import { Icons, IconWrapper } from '../../../../components/icons';
import { ListColumnView } from '../types';
import { useStrings } from '../hooks/useStrings';

interface ColumnProps {
  count: number;
  setColumns: (columns: ListColumnView) => void;
}

interface SearchProps {
  keyword: string;
  setKeyword: (kw: string) => void;
}

interface NftsHeaderProps {
  numNfts: number;
  columns: ColumnProps;
  search: SearchProps;
  listColumnViews: ListColumnView[];
}

export default function NftsHeader({ numNfts, columns, search, listColumnViews }: NftsHeaderProps) {
  const strings = useStrings();

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="30px" paddingBottom="16px">
      <Typography component="div" variant="h5" color="ds.el_gray_medium" fontWeight={500} fontSize="18px" id="nftsList-nftsCount-text">
        {numNfts === 0 ? strings.nfts : strings.nftsCount(numNfts)}
      </Typography>
      <Box display="flex" alignItems="center">
        <Stack direction="row" spacing={1} marginRight="30px">
          {listColumnViews.map(col => (
            <Box
              key={col.count}
              sx={{ bgcolor: col.count === columns.count ? 'ds.gray_200' : 'transparent', borderRadius: '8px' }}
              onClick={() => columns.setColumns(col)}
              id={`nftsList-${col.count}_columnView-button`}
            >
              {col.Icon}
            </Box>
          ))}
        </Stack>
        <SearchInput
          value={search.keyword}
          onChange={e => search.setKeyword(e.target.value)}
          placeholder={strings.searchNfts}
          endAdornment={
            search.keyword !== '' && (
              <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                <IconWrapper icon={Icons.Cross} onClick={() => search.setKeyword('')} id="nftsList:search-clear-button" />
              </InputAdornment>
            )
          }
          id="nftsList-search-input"
        />
      </Box>
    </Box>
  );
}
