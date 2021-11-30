// @flow
// import axios from 'axios';

import type { Node } from 'react';
import { useEffect, useState } from 'react';
import { styled, Box } from '@mui/system';
import {
  ImageListItem,
  Typography,
} from '@mui/material';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import type { GetNftImageInfoResponse } from '../../../api/ada/lib/state-fetch/types';
import LoadingSpinner from '../../widgets/LoadingSpinner';

export function NftCardImage(props: {|
  ipfsUrl: ?string,
  name: ?string,
  fingerprint: string,
  type: 'list' | 'single',
  tokenInfoStore: {|
    getNftImageInfo: {|
      fingerprint: string,
      networkId: number
    |} => Promise<GetNftImageInfoResponse>
  |},
  wallets: {| selected: null | PublicDeriver<> |}
|}): Node {
  const [validated, setValidated] = useState(false);
  const [smallImageUrl, setSmallImageUrl] = useState('');
  const [largeImageUrl, setLargeImageUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      if (props.wallets.selected) {
        const network = props.wallets.selected.getParent().getNetworkInfo();
        const info = await props.tokenInfoStore.getNftImageInfo({
          fingerprint: props.fingerprint,
          networkId: network.NetworkId
        });
        if (info.status === 'validated') {
          if (info.info) {
            if (props.type === 'list') {
              const smallImg = new Image();
              smallImg.onload = () => {
                setSmallImageUrl(info.info?.smallVariantFile);
                setValidated(true);
              };
              smallImg.src = info.info.smallVariantFile;
            } else {
              const largeImg = new Image();
              largeImg.onload = () => {
                setLargeImageUrl(info.info?.largeVariantFile);
                setValidated(true);
              };
              largeImg.src = info.info.largeVariantFile;
            }
          }
        } else {
          setValidated(false);
        }
      }
    }
    load()
  }, [])

  if (props.type === 'list') {
    return (
      <ListImageItem sx={{ height: '100%' }}>
        {
          validated
            ? <img src={smallImageUrl} alt={props.name} loading="lazy" />
            : <LoadingSpinner />
        }
        <Typography mt="16px" minHeight="48px" color="var(--yoroi-palette-gray-900)">
          {props.name}
        </Typography>
      </ListImageItem>
    );
  }

  return (
    <ImageItem flex="1">
      {
        validated
          ? <img src={largeImageUrl} alt={props.name} loading="lazy" />
          : <LoadingSpinner />
      }
    </ImageItem>
  );
}

const ListImageItem = styled(ImageListItem)({
  padding: '16px',
  paddingBottom: '12px',
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  img: {
    borderRadius: '8px',
  },
});

const ImageItem = styled(Box)({
  padding: '40px',
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  img: {
    margin: '0 auto',
    overflow: 'hidden',
    display: 'block',
    maxWidth: '365px',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
});