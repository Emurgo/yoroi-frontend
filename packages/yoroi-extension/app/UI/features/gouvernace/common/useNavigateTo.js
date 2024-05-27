import { useHistory } from 'react-router-dom';
import React, { useRef } from 'react';
import { ROUTES } from '../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    selectStatus: () => history.push(ROUTES.Gouvernance.ROOT),
    delegationForm: () => history.push(ROUTES.Gouvernance.DELEGATE),
    transactionSubmited: () => history.push(ROUTES.Gouvernance.SUBMITTED),
    transactionFail: () => history.push(ROUTES.Gouvernance.FAIL),
  }).current;
};
