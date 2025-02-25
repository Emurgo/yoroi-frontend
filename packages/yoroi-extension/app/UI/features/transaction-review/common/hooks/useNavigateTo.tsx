import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    transactionFail: () => history.push(ROUTES.TX_REVIEW.FAIL),
  }).current;
};
