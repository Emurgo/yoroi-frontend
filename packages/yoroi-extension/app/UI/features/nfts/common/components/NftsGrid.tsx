import { Grid } from '@mui/material';
import { Nft } from '../types';
import { useNavigateTo } from '../hooks/useNavigateTo';
import NftCard from './NftCard';
import { captureEvent } from '../../../../../../posthog';

export default function NftsGrid({ columnsCount, nftsList }: { columnsCount: number; nftsList: Nft[] }) {
  const navigateTo = useNavigateTo();
  return (
    <Grid container columns={columnsCount} spacing="24px">
      {nftsList.map((nft, index) => (
        <Grid key={nft.id} item xs={1} sx={{ aspectRatio: '1/1' }}>
          <NftCard
            onClick={() => {
              captureEvent('NFT Gallery Details Page Viewed');
              navigateTo.nftDetails(nft.id);
            }}
            ipfsUrl={nft.image}
            name={nft.name}
            nftPathId={`nftsList:nft_${index}`}
          />
        </Grid>
      ))}
    </Grid>
  );
}
