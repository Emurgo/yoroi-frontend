import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    portfolio: () => history.push(ROUTES.PORTFOLIO.ROOT),
    portfolioDapps: () => history.push(ROUTES.PORTFOLIO.DAPPS),
    portfolioDetail: (tokenId: string) => history.push(`${ROUTES.PORTFOLIO.ROOT}/details/${tokenId}`),
    swapPage: (tokenId: string) => history.push(`${ROUTES.SWAP.ROOT}?tokenId=${tokenId}`),
    sendPage: () => history.push(ROUTES.WALLETS.SEND),
    receivePage: () => history.push(ROUTES.WALLETS.RECEIVE.ROOT),
  }).current;
};
