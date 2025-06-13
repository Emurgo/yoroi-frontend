import React from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    nftGallery: () => navigate(ROUTES.NFT_GALLERY.ROOT),
    nftDetails: (tokenId: string) => navigate(`${ROUTES.NFT_GALLERY.DETAILS.replace(':nftId', tokenId)}`),
  }).current;
};
