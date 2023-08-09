// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import {
  ImageList,
  ImageListItem,
  InputAdornment,
  Stack,
  Typography,
  Skeleton,
  OutlinedInput,
  Button,
  IconButton,
} from '@mui/material';
import { ReactComponent as Search } from '../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as DefaultNFT } from '../../../assets/images/default-nft.inline.svg';
import { ReactComponent as NotFound } from '../../../assets/images/assets-page/no-nft-found.inline.svg';
import { ReactComponent as Grid2x2 } from '../../../assets/images/assets-page/grid-2x2.inline.svg';
import { ReactComponent as Grid3x3 } from '../../../assets/images/assets-page/grid-3x3.inline.svg';
import { ReactComponent as Close } from '../../../assets/images/assets-page/close.inline.svg';

import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';
import { useState, useEffect } from 'react';
import globalMessages from '../../../i18n/global-messages';
import { urlResolveIpfs } from '../../../coreUtils';
import classNames from 'classnames';

type Props = {|
  list: Array<{| id: string, name: string, image: string | null |}>,
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
    defaultMessage: '!!!Search NFTs',
  },
  nftsCount: {
    id: 'wallet.nftGallary.details.nftsCount',
    defaultMessage: '!!!NFTs ({number})',
  },
});

const listColumnViews = [
  { count: 4, Icon: Grid2x2, imageDims: '264px' },
  { count: 6, Icon: Grid3x3, imageDims: '165px' },
];

function NfTsList({ list, intl }: Props & Intl): Node {
  const [columns, setColumns] = useState(listColumnViews[0]);
  const [nftList, setNftList] = useState([...list]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...list];
    const filteredAssetsList = nftsListCopy.filter(a => {
      return [a.name, a.id].some(val => val.match(regExp));
    });
    setNftList(filteredAssetsList);
  }, [keyword, list]);

  return (
    <Box
      sx={{
        height: 'content',
        width: '100%',
        bgcolor: 'var(--yoroi-palette-common-white)',
        borderRadius: '8px',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="30px"
        paddingBottom="16px"
      >
        <Typography
          variant="h5"
          color="var(--yoroi-palette-common-black)"
          fontWeight={500}
          fontSize="18px"
        >
          {list.length === 0
            ? intl.formatMessage(globalMessages.sidebarNfts)
            : intl.formatMessage(messages.nftsCount, { number: list.length })}
        </Typography>
        <Box display="flex" alignItems="center">
          <Stack direction="row" spacing={1} marginRight="30px">
            {listColumnViews.map(({ count, Icon, imageDims }) => (
              <Button
                key={count}
                onClick={() => setColumns({ count, Icon, imageDims })}
                className={classNames(count === columns.count && 'active')}
                variant="segmented"
              >
                <Icon />
              </Button>
            ))}
          </Stack>
          <SearchInput
            disableUnderline
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder={intl.formatMessage(messages.searchNFTs)}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            endAdornment={
              keyword !== '' && (
                <InputAdornment position="end">
                  <IconButton sx={{ mr: '-10px' }} onClick={() => setKeyword('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </Box>
      </Box>
      {!nftList.length ? (
        <Stack
          sx={{
            height: '518px',
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
        <ImageList
          sx={{ width: '100%', paddingBottom: '30px', _maxWidth: '1248px', mx: 'auto' }}
          cols={columns.count}
          gap={24}
        >
          {nftList.map(nft => {
            return (
              <SLink key={nft.id} to={ROUTES.NFTS.DETAILS.replace(':nftId', nft.id)}>
                <NftCardImage
                  ipfsUrl={nft.image}
                  name={nft.name}
                  width={columns.imageDims}
                  height={columns.imageDims}
                />
              </SLink>
            );
          })}
        </ImageList>
      )}
    </Box>
  );
}

export default (injectIntl(NfTsList): ComponentType<Props>);

function imageExists(imageSrc: string, onload: void => void, onerror: void => void) {
  const img = new Image();
  img.onload = onload;
  img.onerror = onerror;
  img.src = imageSrc;
}

export function NftImage({
  imageUrl,
  name,
  width,
  height,
}: {|
  imageUrl: string | null,
  name: string,
  width: string,
  height: string,
|}): Node {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const url = urlResolveIpfs(imageUrl);

  useEffect(() => {
    if (url !== null)
      imageExists(
        String(url),
        () => {
          setLoading(false);
          setError(false);
        }, // on-success
        () => {
          setLoading(false);
          setError(true);
        } // on-error
      );
  }, [url]);

  if (error || url === null)
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width,
          height,
        }}
      >
        <DefaultNFT />
      </Box>
    );

  if (loading) return <Skeleton variant="rectangular" animation="wave" sx={{ width, height }} />;
  return (
    <img
      style={{
        width,
        height,
        minWidth: width,
        minHeight: height,
        maxWidth: width,
        maxHeight: height,
        flex: '1',
        objectFit: 'cover',
        display: 'inline-block',
      }}
      src={url}
      alt={name}
      loading="lazy"
    />
  );
}

function NftCardImage({
  ipfsUrl,
  name,
  width,
  height,
}: {|
  ipfsUrl: string | null,
  name: string,
  width: string,
  height: string,
|}) {
  return (
    <ImageListItem sx={{ height: '100%', width }}>
      <Box sx={{ width, height, overflow: 'hidden', borderRadius: '4px' }}>
        <NftImage imageUrl={ipfsUrl} name={name} width={width} height={height} />
      </Box>
      <Typography
        mt="16px"
        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        minHeight="48px"
        color="var(--yoroi-palette-gray-900)"
      >
        {name}
      </Typography>
    </ImageListItem>
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
