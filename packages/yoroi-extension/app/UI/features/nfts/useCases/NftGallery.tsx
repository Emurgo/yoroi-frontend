import React from 'react';
import { useNfts } from '../common/hooks/useNfts';
// import { ampli } from '../../../../../ampli';

const NftGallery = () => {
  const { nftsList } = useNfts();
  //   React.useEffect(() => {
  //     console.log('nftsLiset', nftsList);
  //     ampli.nftGalleryPageViewed({
  //       nft_count: nftsList.length,
  //     });
  //   }, []);
  return <div>{nftsList.length}</div>;
};

export default NftGallery;
