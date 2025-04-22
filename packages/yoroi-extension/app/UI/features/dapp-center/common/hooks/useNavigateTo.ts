import React from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    portfolio: () => navigate(ROUTES.PORTFOLIO.ROOT),
    portfolioDapps: () => navigate(ROUTES.PORTFOLIO.DAPPS),
    portfolioDetail: (tokenId: string) => navigate(`${ROUTES.PORTFOLIO.ROOT}/details/${tokenId}`),
    swapPage: (tokenId?: string) => navigate(`${ROUTES.SWAP.ROOT}?tokenId=${tokenId}`),
    sendPage: () => navigate(ROUTES.WALLETS.SEND),
    receivePage: () => navigate(ROUTES.WALLETS.RECEIVE.ROOT),
  }).current;
};
