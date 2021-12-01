// @flow
import styles from './NftCardImage.scss'

import IconEyeClosed from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';

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
      networkId: number,
      skipValidation: boolean,
    |} => Promise<GetNftImageInfoResponse>
  |},
  wallets: {| selected: null | PublicDeriver<> |}
|}): Node {
  const [validated, setValidated] = useState(false);
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [blurImage, setBlurImage] = useState(false);

  const setImage = (imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      setImageUrl(imgSrc);
      setValidated(true);
    };
    img.src = imgSrc;
  };

  useEffect(() => {
    let skipValidation = false;
    let interval: any;
    const load = async () => {
      if (props.wallets.selected) {
        const network = props.wallets.selected.getParent().getNetworkInfo();
        const info = await props.tokenInfoStore.getNftImageInfo({
          fingerprint: props.fingerprint,
          networkId: network.NetworkId,
          skipValidation
        });
        if (info.status === 'validated') {
          clearInterval(interval)
          if (info.info) {
            if (info.info.category !== 'RED') {
              if (props.type === 'list') {
                setImage(info.info.smallVariantFile);
              } else {
                setImage(info.info.largeVariantFile);
              }
              if (info.info.category === 'YELLOW') {
                setBlurImage(true);
              }
            } else {
              setValidated(true);
            }
            setCategory(info.info.category);
          }
        } else {
          skipValidation = true;
          setValidated(false);
        }
      }
    }
    interval = setInterval(async () => {
      await load();
    }, 10000);
  }, []);

  const toggleImageDisplay = () => {
    setBlurImage(!blurImage);
  };

  let overlay: Node;
  if (blurImage) {
    overlay =
      <Box className={styles.overlayText}>
        <Typography mt="16px" minHeight="48px" align="center">
          <IconEyeClosed />
        </Typography>
        {
          props.type === 'single'
            ?
              <Typography mt="16px" minHeight="48px" align="center">
                Possibly sensitive content found. Click on the image to toggle the display.
              </Typography>
            : <></>
        }
      </Box>
  }

  let display: Node;
  if (category !== 'RED') {
    display =
      <div className={styles.imgContainer}>
        {
          category !== 'RED'
            ?
              <img
                className={blurImage ? styles.blurredImg : ''}
                src={imageUrl}
                alt={props.name}
                loading="lazy"
              />
            : <></>
        }
        {overlay}
      </div>
  } else {
    display =
      <Box>
        <Typography mt="16px" minHeight="48px" align="center">
          The image cannot be displayed on Yoroi.
        </Typography>
      </Box>
  }

  if (props.type === 'list') {
    return (
      <ListImageItem sx={{ height: '100%' }}>
        {
          validated
            ? display
            : <LoadingSpinner />
        }
        <Typography mt="16px" minHeight="48px" color="var(--yoroi-palette-gray-900)">
          {props.name}
        </Typography>
      </ListImageItem>
    );
  }

  return (
    <ImageItem flex="1" onClick={category === 'YELLOW' ? toggleImageDisplay : () => {}}>
      {
        validated
          ? display
          : <LoadingSpinner />
      }
    </ImageItem>
  );
}

const ListImageItem = styled(ImageListItem)({
  overflow: 'hidden',
  padding: '16px',
  paddingBottom: '12px',
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
});

const ImageItem = styled(Box)({
  overflow: 'hidden',
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
  },
});