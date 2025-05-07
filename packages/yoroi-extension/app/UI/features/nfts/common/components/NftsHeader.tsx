import { InputAdornment } from '@mui/material';
import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { defineMessages } from 'react-intl';
import globalMessages from '../../../../../i18n/global-messages';
import { useIntl } from '../../../../context/IntlProvider';
import { SearchInput } from '../../../../components/Input/SearchInput';
import { Icons, IconWrapper } from '../../../../components/icons';
import { ListColumnView } from '../types';

const messages = defineMessages({
  searchNFTs: {
    id: 'wallet.nftGallary.search',
    defaultMessage: '!!!Search NFTs',
  },
  nftsCount: {
    id: 'wallet.nftGallary.details.nftsCount',
    defaultMessage: '!!!NFTs ({number})',
  },
});

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
  const { intl } = useIntl();

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="30px" paddingBottom="16px">
      <Typography component="div" variant="h5" color="ds.el_gray_medium" fontWeight={500} fontSize="18px">
        {numNfts === 0
          ? intl.formatMessage(globalMessages.sidebarNfts)
          : intl.formatMessage(messages.nftsCount, { number: numNfts })}
      </Typography>
      <Box display="flex" alignItems="center">
        <Stack direction="row" spacing={1} marginRight="30px">
          {listColumnViews.map(col => (
            <Box
              key={col.count}
              sx={{ bgcolor: col.count === columns.count ? 'ds.gray_200' : 'transparent', borderRadius: '8px' }}
              onClick={() => columns.setColumns(col)}
            >
              {col.Icon}
            </Box>
          ))}
        </Stack>
        <SearchInput
          value={search.keyword}
          onChange={e => search.setKeyword(e.target.value)}
          placeholder={intl.formatMessage(messages.searchNFTs)}
          endAdornment={
            search.keyword !== '' && (
              <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                <IconWrapper icon={Icons.Cross} onClick={() => search.setKeyword('')} />
              </InputAdornment>
            )
          }
        />
      </Box>
    </Box>
  );
}
