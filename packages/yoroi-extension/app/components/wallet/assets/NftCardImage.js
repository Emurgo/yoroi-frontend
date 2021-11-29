// @flow
import type { Node } from 'react';
import { styled, Box } from '@mui/system';
import {
  ImageListItem,
  Typography,
} from '@mui/material';

export function NftCardImage(props: {|
  ipfsUrl: ?string,
  name: ?string,
  type: 'list' | 'single'
|}): Node {
  const ipfsHash = props.ipfsUrl != null ? props.ipfsUrl.replace('ipfs://', '') : '';

  if (props.type === 'list') {
    return (
      <ListImageItem sx={{ height: '100%' }}>
        <img src={`https://ipfs.io/ipfs/${ipfsHash}`} alt={props.name} loading="lazy" />
        <Typography mt="16px" minHeight="48px" color="var(--yoroi-palette-gray-900)">
          {props.name}
        </Typography>
      </ListImageItem>
    );
  }

  return (
    <ImageItem flex="1">
      <img src={`https://ipfs.io/ipfs/${ipfsHash}`} alt={props.name} loading="lazy" />
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