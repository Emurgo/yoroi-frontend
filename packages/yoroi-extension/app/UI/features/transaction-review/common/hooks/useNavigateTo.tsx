import React from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../../../routes-config';

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return React.useRef({
    transactionFail: () => navigate(ROUTES.TX_REVIEW.FAIL),
    transactionSuccess: () => navigate(ROUTES.TX_REVIEW.SUCCESS),
    walletTransactions: () => navigate(ROUTES.WALLETS.TRANSACTIONS),
  }).current;
};
