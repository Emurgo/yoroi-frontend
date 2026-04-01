import { useNavigate } from 'react-router';
import React from 'react';
import { ROUTES } from '../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    selectRevampStatus: () => navigate(ROUTES.GOVERNANCE.ROOT),
    selectRevampOptions: () => navigate(ROUTES.GOVERNANCE.OPTIONS),
    selectDrepList: () => navigate(ROUTES.GOVERNANCE.DREP_LIST),
  }).current;
};
