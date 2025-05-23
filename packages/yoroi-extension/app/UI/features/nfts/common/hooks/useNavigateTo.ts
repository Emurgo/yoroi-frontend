import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    nftGallery: () => history.push(ROUTES.NFT_GALLERY.ROOT),
    nftDetails: (tokenId: string) => history.push(`${ROUTES.NFT_GALLERY.DETAILS.replace(':nftId', tokenId)}`),
  }).current;
};
