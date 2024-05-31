import { useHistory } from 'react-router-dom';
import React, { useRef } from 'react';
import { ROUTES } from '../../../../routes-config';

export const useNavigateTo = () => {
  const history = useHistory();

  return React.useRef({
    selectStatus: () => history.push(ROUTES.Governance.ROOT),
    delegationForm: () => history.push(ROUTES.Governance.DELEGATE),
    transactionSubmited: () => history.push(ROUTES.Governance.SUBMITTED),
    transactionFail: () => history.push(ROUTES.Governance.FAIL),
  }).current;
};
