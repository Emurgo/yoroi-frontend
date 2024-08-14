// @flow
import { Grid, IconButton, InputAdornment, OutlinedInput, Skeleton, Stack, Typography, Box, styled } from '@mui/material';
import type { Node, ComponentType } from 'react';
import { ReactComponent as Close } from '../../../assets/images/assets-page/close.inline.svg';
import { ReactComponent as Grid2x2 } from '../../../assets/images/assets-page/grid-2x2.inline.svg';
import { ReactComponent as Grid3x3 } from '../../../assets/images/assets-page/grid-3x3.inline.svg';
import { ReactComponent as NotFound } from '../../../assets/images/assets-page/no-nft-found.inline.svg';
import { ReactComponent as Search } from '../../../assets/images/assets-page/search.inline.svg';
import { ReactComponent as DefaultNFT } from '../../../assets/images/default-nft.inline.svg';

import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { ampli } from '../../../../ampli/index';
import { urlResolveForIpfsAndCorsproxy } from '../../../coreUtils';
import globalMessages from '../../../i18n/global-messages';
import { ROUTES } from '../../../routes-config';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';

const SEARCH_ACTIVATE_DEBOUNCE_WAIT = 1000;

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
  const setColumnsAndTrack = function (column) {
    setColumns(column);
    ampli.nftGalleryGridViewSelected({
      nft_grid_view: column.count === 4 ? '4_rows' : '6_rows',
    });
  };

  const [nftList, setNftList] = useState([...list]);
  const [keyword, setKeyword] = useState('');
  const trackSearch = useCallback(
    debounce((nftCount: number, nftSearchTerm: string) => {
      if (nftSearchTerm !== '') {
        ampli.nftGallerySearchActivated({
          nft_count: nftCount,
          nft_search_term: nftSearchTerm,
        });
      }
    }, SEARCH_ACTIVATE_DEBOUNCE_WAIT),
    []
  );

  useEffect(() => {
    const regExp = new RegExp(keyword, 'gi');
    const nftsListCopy = [...list];
    const filteredAssetsList = nftsListCopy.filter(a => {
      return [a.name, a.id].some(val => val.match(regExp));
    });
    setNftList(filteredAssetsList);
    if (keyword !== '') {
      trackSearch(filteredAssetsList.length, keyword);
    }
  }, [keyword, list]);

  return (
    <Box
      sx={{
        height: 'content',
        width: '100%',
        bgcolor: 'ds.bg_color_min',
        p: '24px',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="30px" paddingBottom="16px">
        <Typography component="div" variant="h5" color="ds.el_gray_medium" fontWeight={500} fontSize="18px">
          {list.length === 0
            ? intl.formatMessage(globalMessages.sidebarNfts)
            : intl.formatMessage(messages.nftsCount, { number: list.length })}
        </Typography>
        <Box display="flex" alignItems="center">
          <Stack direction="row" spacing={1} marginRight="30px">
            {listColumnViews.map(({ count, Icon, imageDims }) => (
              <SButton
                active={count === columns.count}
                key={count}
                onClick={() => setColumnsAndTrack({ count, Icon, imageDims })}
                variant="segmented"
              >
                <Icon />
              </SButton>
            ))}
          </Stack>
          <SearchInput
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
          <Typography component="div" variant="h5" fontWeight={500} color="ds.text_gray_medium">
            {intl.formatMessage(!list.length ? messages.noNFTsAdded : messages.noResultsFound)}
          </Typography>
        </Stack>
      ) : (
        <Grid container columns={columns.count} spacing="24px">
          {nftList.map(nft => {
            return (
              <Grid
                item
                xs={1}
                sx={{
                  aspectRatio: '1/1',
                }}
              >
                <SLink
                  key={nft.id}
                  to={ROUTES.NFTS.DETAILS.replace(':nftId', nft.id)}
                  onClick={() => {
                    ampli.nftGalleryDetailsPageViewed();
                  }}
                >
                  <NftCardImage ipfsUrl={nft.image} name={nft.name} />
                </SLink>
              </Grid>
            );
          })}
        </Grid>
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

const SvgWrapper = styled(Box)(({ theme, height }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.ds.gray_100,
  height,
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_low,
    },
  },
}));

export function NftImage({
  imageUrl,
  name,
  width,
  height,
  contentHeight,
}: {|
  imageUrl: ?string,
  name: string,
  width: string,
  height: string,
  contentHeight?: string,
|}): Node {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const url = urlResolveForIpfsAndCorsproxy(imageUrl);

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
      <SvgWrapper height={contentHeight}>
        <DefaultNFT />
      </SvgWrapper>
    );

  if (loading) return <Skeleton variant="rectangular" animation="wave" sx={{ width, height }} />;
  return (
    <Box
      component="img"
      sx={{
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

function NftCardImage({ ipfsUrl, name }: {| ipfsUrl: string | null, name: string |}) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderRadius: '4px', overflow: 'hidden', flex: '1 1 auto' }}>
        <NftImage imageUrl={ipfsUrl} name={name} width="100%" height="100%" contentHeight="334px" />
      </Box>
      <Box>
        <Typography
          component="div"
          mt="16px"
          sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          color="grayscale.900"
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}

const SearchInput = styled(OutlinedInput)(() => ({
  width: '370px',
  height: '40px',
  padding: '10px 12px',
}));

const SLink = styled(Link)({
  textDecoration: 'none',
});

const SButton = styled(IconButton)(({ theme, active }) => ({
  backgroundColor: active && theme.palette.ds.gray_200,
  maxWidth: '40px',
  maxHeight: '40px',
  padding: '8px',
  borderRadius: '8px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
