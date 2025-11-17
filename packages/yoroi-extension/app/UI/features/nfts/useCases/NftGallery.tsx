import { useEffect, useMemo, useState } from 'react';
import { useNfts } from '../common/hooks/useNfts';
import NftsEmptyState from '../common/components/NftsEmptyState';
import { IconWrapper, Icons } from '../../../components/icons';
import NftsGrid from '../common/components/NftsGrid';
import NftsHeader from '../common/components/NftsHeader';
import { ListColumnView } from '../common/types';
import LocalStorageApi from '../../../../api/localStorage/index';
import { captureEvent } from '../../../../../posthog';

const listColumnViews: ListColumnView[] = [
  { count: 4, Icon: <IconWrapper icon={Icons.GridDefault} asButton />, imageDims: '264px' },
  { count: 6, Icon: <IconWrapper icon={Icons.GridDense} asButton />, imageDims: '165px' },
];

const NftGallery = () => {
  const localStorageApi = new LocalStorageApi();
  const { nftsList, loading } = useNfts();
  const [keyword, setKeyword] = useState('');
  const [columns, setColumns] = useState<ListColumnView | undefined>(listColumnViews[0]);

  useEffect(() => {
    if (loading) return;

    captureEvent('NFT Gallery Page Viewed');
  }, [loading]);

  useEffect(() => {
    const loadGridViewState = async () => {
      const viewInStorage = await localStorageApi.getNftGridViewState();
      if (viewInStorage) {
        const savedCount = parseInt(viewInStorage, 10);
        const savedColumn = listColumnViews.find(view => view.count === savedCount);
        if (savedColumn) {
          setColumns(savedColumn);
        }
      }
    };
    loadGridViewState();
  }, []);

  const setColumnsAndTrack = async (column: ListColumnView) => {
    await localStorageApi.setNftGridViewState(column.count.toString());
    setColumns(column);
  };

  const filteredNftsList = useMemo(() => {
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...nftsList];
    return nftsListCopy.filter(a => {
      return [a.name, a.id].some(val => val.match(regExp));
    });
  }, [keyword, nftsList]);

  return (
    <>
      {nftsList.length > 0 && (
        <NftsHeader
          numNfts={filteredNftsList.length}
          listColumnViews={listColumnViews}
          search={{ keyword, setKeyword }}
          columns={{ count: columns?.count || 4, setColumns: setColumnsAndTrack }}
        />
      )}
      {filteredNftsList.length === 0 && <NftsEmptyState isSearch={keyword !== ''} />}
      {filteredNftsList.length > 0 && <NftsGrid columnsCount={columns?.count || 4} nftsList={filteredNftsList} />}
    </>
  );
};

export default NftGallery;
