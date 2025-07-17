import { useEffect, useState } from 'react';
import { getTokenIdentifierIfExists, getTokenStrictName } from '../../../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../../../utils/formatters';
import {
  getImageFromTokenMetadata,
  getAuthorFromTokenMetadata,
  getDescriptionFromTokenMetadata,
} from '../../../../../utils/nftMetadata';
import { useNftGallery } from '../../module/NftGalleryContextProvider';
import { NetworkUrl, Nft } from '../types';
import { useParams } from 'react-router';
import { getNetworkById, isCardanoHaskell } from '../../../../../api/ada/lib/storage/database/prepackaged/networks';
import { getNetworkUrl } from '../../../../utils/getNetworkUrl';

export const useNfts = () => {
  const { spendableBalance, getTokenInfo, selectedWallet } = useNftGallery();
  const [loading, setLoading] = useState(true);
  const [nftsList, setNftsList] = useState<Nft[]>([]);
  const [currentNft, setCurrentNft] = useState<Nft | null>(null);
  const [currentNftIndex, setCurrentNftIndex] = useState<number>(0);
  const params = useParams<{ nftId: string | undefined }>();
  const network = getNetworkById(selectedWallet?.networkId);
  const isHaskell = isCardanoHaskell(network);
  const networkUrl: NetworkUrl = isHaskell ? getNetworkUrl(network) : null;

  useEffect(() => {
    if (spendableBalance == null) {
      return;
    }
    setLoading(true);
    const nfts = [...spendableBalance.nonDefaultEntries()]
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(item => item.info.IsNFT)
      .map(token => {
        const split = token.entry.identifier.split('.');
        const policyId = split[0];
        const hexName = split[1] ?? '';
        const fullName = getTokenStrictName(token.info).name;
        const name = truncateToken(fullName ?? '-');
        return {
          name,
          policyId,
          assetName: hexName,
          ticker: token.info.Metadata.ticker ?? '-',
          metadata: token.info.Metadata,
          id: getTokenIdentifierIfExists(token.info) ?? '-',
          image: getImageFromTokenMetadata(policyId, hexName, token.info.Metadata),
          description: getDescriptionFromTokenMetadata(policyId, fullName, token.info.Metadata),
          author: getAuthorFromTokenMetadata(policyId, fullName, token.info.Metadata),
        };
      });

    setNftsList(nfts);
    setLoading(false);
  }, [selectedWallet]);

  useEffect(() => {
    if (!loading) {
      const nftId = params.nftId;
      if (nftsList.length > 0 && nftId) {
        const index = nftsList.findIndex(nft => nft.id === nftId);
        setCurrentNft(nftsList[index] || null);
        setCurrentNftIndex(index);
      } else {
        setCurrentNft(null);
        setCurrentNftIndex(-1);
      }
    }
  }, [params.nftId, nftsList, selectedWallet, loading]);

  return {
    networkUrl,
    nftsList,
    currentNft,
    currentNftIndex,
    loading,
  };
};
