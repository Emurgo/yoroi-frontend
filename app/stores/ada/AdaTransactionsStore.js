// @flow
import { computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import { isValidAmountInLovelaces } from '../../utils/validations';
import TransactionsStore from '../TransactionsStore';
import { transactionTypes } from '../../domain/WalletTransaction';

export default class AdaTransactionsStore extends TransactionsStore {

  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const unconfirmedAmount = {
      total: new BigNumber(0),
      incoming: new BigNumber(0),
      outgoing: new BigNumber(0),
    };
    
    return unconfirmedAmount;
  }

  calculateTransactionFee = (walletId: string, receiver: string, amount: string) => {
    //FIXME: Complete this
    const accountId = 'CHANGE_ME'; // this.stores.ada.addresses._getAccountIdByWalletId(walletId);
    //if (!accountId) throw new Error('Active account required before calculating transaction fees.');
    return this.api.ada.calculateTransactionFee({ sender: accountId, receiver, amount });
  };

  validateAmount = (amountInLovelaces: string): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

}
