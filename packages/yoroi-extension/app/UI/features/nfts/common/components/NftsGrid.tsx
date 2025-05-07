import React from 'react';
import { Grid } from '@mui/material';
import { Nft } from '../types';
import { ampli } from '../../../../../../ampli';
import { useNavigateTo } from '../hooks/useNavigateTo';
import NftCard from './NftCard';

export default function NftsGrid({ columnsCount, nftsList }: { columnsCount: number; nftsList: Nft[] }) {
  const navigateTo = useNavigateTo();
  return (
    <Grid container columns={columnsCount} spacing="24px">
      {nftsList.map(nft => (
        <Grid key={nft.id} item xs={1} sx={{ aspectRatio: '1/1' }}>
          <NftCard
            onClick={() => {
              ampli.nftGalleryDetailsPageViewed();
              navigateTo.nftDetails(nft.id);
            }}
            ipfsUrl={nft.image}
            name={nft.name}
          />
        </Grid>
      ))}
    </Grid>
  );
}
