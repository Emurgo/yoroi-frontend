import React from 'react';
import { Grid, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { Nft } from '../types';
import { ROUTES } from '../../../../../routes-config';
import NftCard from './NftCard';
import { ampli } from '../../../../../../ampli';

const SLink = styled(Link)({
  textDecoration: 'none',
});

export default function NftsGrid({ columnsCount, nftsList }: { columnsCount: number; nftsList: Nft[] }) {
  return (
    <Grid container columns={columnsCount} spacing="24px">
      {nftsList.map(nft => (
        <Grid key={nft.id} item xs={1} sx={{ aspectRatio: '1/1' }}>
          <SLink
            to={ROUTES.NFT_GALLERY.DETAILS.replace(':nftId', nft.id)}
            onClick={() => {
              ampli.nftGalleryDetailsPageViewed();
            }}
          >
            <NftCard ipfsUrl={nft.image} name={nft.name} />
          </SLink>
        </Grid>
      ))}
    </Grid>
  );
}
