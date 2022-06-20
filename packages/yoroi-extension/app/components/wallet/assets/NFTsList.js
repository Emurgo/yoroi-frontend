// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import {
  IconButton,
  ImageList,
  ImageListItem,
  InputAdornment,
  Stack,
  Typography,
  Skeleton,
  OutlinedInput
} from '@mui/material';
import { ReactComponent as Search }  from '../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as DefaultNFT } from '../../../assets/images/default-nft.inline.svg';
import { ReactComponent as NotFound }  from '../../../assets/images/assets-page/no-nft-found.inline.svg';

import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import { useState, useEffect } from 'react';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  list: Array<{| name: string, image: string | void |}> | void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  noResultsFound: {
    id: 'wallet.assets.nft.noResultsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNFTsAdded: {
    id: 'wallet.nftGallary.noNFTsAdded',
    defaultMessage: '!!!No NFTs added to your wallet',
  },
  searchNFTs: {
    id: 'wallet.nftGallary.search',
    defaultMessage: '!!!Search NFTs'
  },
  nftsCount: {
    id: 'wallet.nftGallary.details.nftsCount',
    defaultMessage: '!!!NFTs ({number})',
  },
});

const listColumnViews = [
  { count: 2, gap: 32 },
  { count: 4, gap: 32 },
  { count: 6, gap: 16 },
];

const getDefaultColumnsView = () => listColumnViews[1];
function NfTsList({ list, intl }: Props & Intl): Node {
  if (list == null) return null;
  const [columns, setColumns] = useState(getDefaultColumnsView());
  const [nftList, setNftList] = useState([...list]);

  const search: (e: SyntheticEvent<HTMLInputElement>) => void = (
    event: SyntheticEvent<HTMLInputElement>
  ) => {
    const keyword = event.currentTarget.value;
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...list];
    const filteredAssetsList = nftsListCopy.filter(a => a.name.match(regExp));
    setNftList(filteredAssetsList);
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="30px">
        <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
          {!list.length ?
            intl.formatMessage(globalMessages.sidebarNfts)
            : intl.formatMessage(messages.nftsCount, { number: list.length })}
        </Typography>
        <Box display="flex" alignItems="center">
          <Stack direction="row" spacing={1} marginRight="30px">
            {listColumnViews.map(column => (
              <IconButton
                key={column.count}
                onClick={() => setColumns(column)}
                sx={{
                  width: '40px',
                  backgroundColor:
                    column.count === columns.count ? 'var(--yoroi-palette-gray-300)' : 'none',
                }}
              >
                =
              </IconButton>
            ))}
          </Stack>
          <SearchInput
            disableUnderline
            onChange={search}
            placeholder={intl.formatMessage(messages.searchNFTs)}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
          />
        </Box>
      </Box>
      {!nftList.length ? (
        <Stack
          sx={{
            height: '90%',
            flex: '1',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          spacing={2}
        >
          <NotFound />
          <Typography variant="h3" color="var(--yoroi-palette-gray-900)">
            {intl.formatMessage(!list.length ? messages.noNFTsAdded : messages.noResultsFound)}
          </Typography>
        </Stack>
      ) : (
        <ImageList sx={{ width: '100%' }} cols={columns.count} rowHeight="100%" gap={columns.gap}>
          {nftList.map(nft => {
            return (
              <SLink key={nft.name} to={ROUTES.NFTS.DETAILS.replace(':nftId', nft.id)}>
                <NftCardImage ipfsUrl={nft.image} name={nft.name} />
              </SLink>
            );
          })}
        </ImageList>
      )}
    </Box>
  );
}

export default (injectIntl(NfTsList): ComponentType<Props>);

function isImageExist(imageSrc, onload, onerror) {
  const img = new Image();
  img.onload = onload;
  img.onerror = onerror;
  img.src = imageSrc;
}

export function NftImage({ imageUrl, name }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  if (error || !imageUrl) return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--yoroi-palette-gray-100)',
      width: '100%',
      height: '100%',
      minWidth: '250px',
      minHeight: '200px',
    }}
    >
      <DefaultNFT />
    </Box>
  )
  imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  useEffect(() => {
    isImageExist(
      imageUrl,
      () => { setLoading(false); setError(false) }, // on-success
      () => { setLoading(false); setError(true) }, // on-error
    )
  }, [imageUrl])

  if (loading) return <Skeleton variant='rectangular' animation='wave' sx={{ minWidth: '250px', minHeight: '250px', height: '100%' }} />
  return  <img style={{ width: '100%', height: 'auto', flex: '1', minWidth: '250px', objectFit: 'cover' }} src={imageUrl} alt={name} loading="lazy" />
}

function NftCardImage({ ipfsUrl, name }) {
  return (
    <ImageItem sx={{ height: '100%' }}>
      <NftImage imageUrl={ipfsUrl} name={name} />
      <Typography mt="16px" minHeight="48px" color="var(--yoroi-palette-gray-900)">
        {name}
      </Typography>
    </ImageItem>
  );
}

const SearchInput = styled(OutlinedInput)({
  border: '1px solid var(--yoroi-palette-gray-300)',
  borderRadius: '8px',
  width: '370px',
  height: '40px',
  padding: '10px 12px',
});
const SLink = styled(Link)({
  textDecoration: 'none',
});
const ImageItem = styled(ImageListItem)({
  padding: '16px',
  paddingBottom: '12px',
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  img: {
    borderRadius: '8px',
  },
});
