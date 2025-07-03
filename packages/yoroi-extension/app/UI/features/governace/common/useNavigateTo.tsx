import { useNavigate } from 'react-router';
import React from 'react';
import { ROUTES } from '../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    selectStatus: () => navigate(ROUTES.Governance.ROOT),
    delegationForm: () => navigate(ROUTES.Governance.DELEGATE),
    transactionSubmited: () => navigate(ROUTES.Governance.SUBMITTED),
    transactionFail: () => navigate(ROUTES.Governance.FAIL),
  }).current;
};
