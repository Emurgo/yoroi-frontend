// @flow
import type { AdaTransactionFee } from './types';
import { getPaymentFee } from './ada-methods';

export type AdaTxFeeParams = {
  sender: string,
  receiver: string,
  amount: string,
  // "groupingPolicy" - Spend everything from the address
  // "OptimizeForSize" for no grouping
  groupingPolicy: ?'OptimizeForSecurity' | 'OptimizeForSize',
};

export const adaTxFee = (feeParams: AdaTxFeeParams): Promise<AdaTransactionFee> => (
  getPaymentFee(feeParams)
  .then(fee => Promise.resolve({
    getCCoin: fee
  }))
);
