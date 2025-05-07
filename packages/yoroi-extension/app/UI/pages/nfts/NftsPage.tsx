import React from 'react';
import NftsLayout from './layout';
import NftGallery from '../../features/nfts/useCases/NftGallery';

type Props = {
  stores: any;
  actions: any;
};

const NftsPage = (props: Props) => {
  return (
    <NftsLayout {...props}>
      <NftGallery />
    </NftsLayout>
  );
};

export default NftsPage;
