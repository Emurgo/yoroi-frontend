import React, { useEffect, useState } from 'react';
import { Box, Skeleton, styled, SxProps } from '@mui/material';
import { urlResolveForIpfsAndCorsproxy } from '../../../../../coreUtils';
import { checkImageLoads } from '../helpers/index';
import { DefaultNft } from '../../../../components/ilustrations';

interface NftImageProps {
  imageUrl: string | undefined;
  name: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  contentHeight?: string;
  imageSx?: SxProps;
}

export default function NftImage({
  imageUrl,
  name,
  contentHeight,
  width = 'auto',
  height = 'auto',
  imageSx = {},
}: NftImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const url = urlResolveForIpfsAndCorsproxy(imageUrl);

  useEffect(() => {
    if (url !== null)
      checkImageLoads(
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
      <SvgWrapper height={contentHeight ? contentHeight : '100%'}>
        <DefaultNft />
      </SvgWrapper>
    );

  if (loading) return <Skeleton variant="rectangular" animation="wave" sx={{ width, height }} />;

  return (
    <Box
      component="img"
      sx={{
        width,
        height,
        objectFit: 'cover',
        display: 'inline-block',
        ...imageSx,
      }}
      src={url}
      alt={name}
      loading="lazy"
    />
  );
}

const SvgWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({ theme }) => {
    // @ts-ignore
    return theme.palette.ds.gray_100;
  }};
  height: 100%;
  & svg {
    & path {
      fill: ${({ theme }) => {
        // @ts-ignore
        return theme.palette.ds.el_gray_low;
      }};
    }
  }
`;
