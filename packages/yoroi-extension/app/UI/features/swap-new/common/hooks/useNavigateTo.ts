import React from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    swapReview: () => navigate(ROUTES.SWAP_REVAMP.REVIEW),
    swapAssets: () => navigate(ROUTES.SWAP_REVAMP.ASSET_SWAP),
  }).current;
};
