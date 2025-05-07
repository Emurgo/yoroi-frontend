import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNfts } from '../common/hooks/useNfts';
import { ampli } from '../../../../../ampli';
import NftsEmptyState from '../common/components/NftsEmptyState';
import { IconWrapper, Icons } from '../../../components/icons';
import NftsGrid from '../common/components/NftsGrid';
import NftsHeader from '../common/components/NftsHeader';
import { debounce } from 'lodash';
import { ListColumnView } from '../common/types';

const listColumnViews: ListColumnView[] = [
  { count: 4, Icon: <IconWrapper icon={Icons.GridDefault} asButton />, imageDims: '264px' },
  { count: 6, Icon: <IconWrapper icon={Icons.GridDense} asButton />, imageDims: '165px' },
];

const SEARCH_ACTIVATE_DEBOUNCE_WAIT = 1000;

const NftGallery = () => {
  const { nftsList, loading } = useNfts();
  const [keyword, setKeyword] = useState('');

  React.useEffect(() => {
    if (loading) return;

    ampli.nftGalleryPageViewed({
      nft_count: nftsList.length,
    });
  }, [loading]);

  const [columns, setColumns] = useState<ListColumnView | undefined>(listColumnViews[0]);

  const setColumnsAndTrack = function (column: ListColumnView) {
    setColumns(column);
    ampli.nftGalleryGridViewSelected({
      nft_grid_view: column.count === 4 ? '4_rows' : '6_rows',
    });
  };

  const trackSearch = useCallback(
    debounce((nftCount: number, nftSearchTerm: string) => {
      if (nftSearchTerm !== '') {
        ampli.nftGallerySearchActivated({
          nft_count: nftCount,
          nft_search_term: nftSearchTerm,
        });
      }
    }, SEARCH_ACTIVATE_DEBOUNCE_WAIT),
    []
  );

  const filteredNftsList = useMemo(() => {
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...nftsList];
    return nftsListCopy.filter(a => {
      return [a.name, a.id].some(val => val.match(regExp));
    });
  }, [keyword, nftsList]);

  useEffect(() => {
    if (keyword !== '') {
      trackSearch(filteredNftsList.length, keyword);
    }
  }, [keyword, filteredNftsList]);

  return (
    <>
      <NftsHeader
        numNfts={filteredNftsList.length}
        listColumnViews={listColumnViews}
        search={{ keyword, setKeyword }}
        columns={{ count: columns?.count || 4, setColumns: setColumnsAndTrack }}
      />
      {filteredNftsList.length === 0 && <NftsEmptyState isSearch={keyword !== ''} />}
      {filteredNftsList.length > 0 && <NftsGrid columnsCount={columns?.count || 4} nftsList={filteredNftsList} />}
    </>
  );
};

export default NftGallery;
