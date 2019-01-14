// @flow
import { computed } from 'mobx';
import BigNumber from 'bignumber.js';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import { isValidAmountInLovelaces } from '../../utils/validations';
import TransactionsStore from '../base/TransactionsStore';
import { transactionTypes } from '../../domain/WalletTransaction';
import { assuranceLevels } from '../../config/transactionAssuranceConfig';
import type { TransactionFeeResponse } from '../../api/ada/index';

export default class AdaTransactionsStore extends TransactionsStore {

  /** Calculate information about transactions that are still realistically reversable */
  @computed get unconfirmedAmount(): UnconfirmedAmount {
    const unconfirmedAmount = {
      total: new BigNumber(0),
      incoming: new BigNumber(0),
      outgoing: new BigNumber(0),
    };

    // Get current wallet
    const wallet = this.stores.substores.ada.wallets.active;
    if (!wallet) return unconfirmedAmount;

    // Get current transactions for wallet
    const result = this._getTransactionsAllRequest(wallet.id).result;
    if (!result || !result.transactions) return unconfirmedAmount;

    for (const transaction of result.transactions) {
      if (transaction.getAssuranceLevelForMode(wallet.assuranceMode) !== assuranceLevels.HIGH) {
        // total
        unconfirmedAmount.total = unconfirmedAmount.total.plus(transaction.amount.absoluteValue());

        // outgoing
        if (transaction.type === transactionTypes.EXPEND) {
          unconfirmedAmount.outgoing = unconfirmedAmount.outgoing.plus(
            transaction.amount.absoluteValue()
          );
        }

        // incoming
        if (transaction.type === transactionTypes.INCOME) {
          unconfirmedAmount.incoming = unconfirmedAmount.incoming.plus(
            transaction.amount.absoluteValue()
          );
        }
      }
    }
    return unconfirmedAmount;
  }

  /** Calculate transaction fee without requiring spending password */
  calculateTransactionFee = (
    walletId: string,
    receiver: string,
    amount: string
  ): Promise<TransactionFeeResponse> => {
    // get HdWallet account
    const accountId = this.stores.substores.ada.addresses._getAccountIdByWalletId(walletId);
    if (!accountId) throw new Error('Active account required before calculating transaction fees.');

    // calculate fee
    return this.api.ada.calculateTransactionFee({ sender: accountId, receiver, amount });
  };

  /** Wrap utility function to expose to components/containers */
  validateAmount = (amountInLovelaces: string): Promise<boolean> => (
    Promise.resolve(isValidAmountInLovelaces(amountInLovelaces))
  );

}
