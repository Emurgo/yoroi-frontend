import { Typography, Stack } from '@mui/material';
import { NftsNotFound } from '../../../../components/ilustrations';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  noResultsFound: {
    id: 'wallet.assets.nft.noResultsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNFTsAdded: {
    id: 'wallet.nftGallary.noNFTsAdded',
    defaultMessage: '!!!No NFTs added to your wallet',
  },
});

type NftsEmptyStateProps = {
  isSearch: boolean;
};

export default function NftsEmptyState({ isSearch }: NftsEmptyStateProps) {
  const intl = useIntl();
  return (
    <Stack
      sx={{
        height: '518px',
        flex: '1',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      spacing={16}
      id="nftsList-emptyState-component"
    >
      <NftsNotFound />
      <Typography component="div" variant="h5" fontWeight={500} color="ds.text_gray_medium" id="nftsList-noNfts-text">
        {intl.formatMessage(isSearch ? messages.noResultsFound : messages.noNFTsAdded)}
      </Typography>
    </Stack>
  );
}
