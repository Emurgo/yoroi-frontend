import { useHistory } from 'react-router-dom';
import React, { useRef } from 'react';
import { ROUTES } from '../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    portfolio: () => history.push(ROUTES.PORTFOLIO.ROOT),
    portfolioDapps: () => history.push(ROUTES.PORTFOLIO.DAPPS),
    portfolioDetail: tokenId => history.push(`${ROUTES.PORTFOLIO.ROOT}/details/${tokenId}`),
  }).current;
};
