import { useEffect, useState } from 'react';
import { getTokenIdentifierIfExists, getTokenStrictName } from '../../../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../../../utils/formatters';
import { getImageFromTokenMetadata } from '../../../../../utils/nftMetadata';
import { useNftGallery } from '../../module/NftGalleryContextProvider';
import { Nft } from '../types';

export const useNfts = () => {
  const { spendableBalance, getTokenInfo } = useNftGallery();
  const [loading, setLoading] = useState(true);
  const [nftsList, setNftsList] = useState<Nft[]>([]);

  useEffect(() => {
    if (spendableBalance == null) {
      return;
    }

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
          id: getTokenIdentifierIfExists(token.info) ?? '-',
          image: getImageFromTokenMetadata(policyId, hexName, token.info.Metadata),
        };
      });

    setNftsList(nfts);
    setLoading(false);
  }, []);

  return { nftsList, loading };
};
