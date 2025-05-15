import React from 'react';
import NftsLayout from './layout';
import NftDetails from '../../features/nfts/useCases/NftDetails';

type Props = {
  stores: any;
  actions: any;
};

const NftDetailsPage = (props: Props) => {
  return (
    <NftsLayout {...props}>
      <NftDetails />
    </NftsLayout>
  );
};

export default NftDetailsPage;
