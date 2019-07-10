// @flow
import { observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssuranceTypes';
import { assuranceLevels } from '../config/transactionAssuranceConfig';

export type TrasactionAddresses = { from: Array<string>, to: Array<string> };

export const transactionStates = Object.freeze({
  PENDING: 'pending',
  FAILED: 'failed',
  OK: 'ok',
});
export type TransactionState =  $Values<typeof transactionStates>;

export const transactionTypes = Object.freeze({
  CARD: 'card',
  EXPEND: 'expend',
  INCOME: 'income',
  EXCHANGE: 'exchange',
  SELF: 'self',
  MULTI: 'multi',
});
export type TransactionDirectionType = $Values<typeof transactionTypes>;


export default class WalletTransaction {

  @observable id: string = '';
  @observable type: TransactionDirectionType;
  @observable title: string = '';
  @observable amount: BigNumber; // fee included
  @observable fee: BigNumber;
  @observable date: Date;
  @observable description: string = '';
  @observable numberOfConfirmations: number = 0;
  @observable addresses: TrasactionAddresses = { from: [], to: [] };
  @observable state: TransactionState;

  constructor(data: {
    id: string,
    type: TransactionDirectionType,
    title: string,
    amount: BigNumber,
    fee: BigNumber,
    date: Date,
    description: string,
    numberOfConfirmations: number,
    addresses: TrasactionAddresses,
    state: TransactionState,
  }) {
    Object.assign(this, data);
  }

  getAssuranceLevelForMode(mode: AssuranceMode): AssuranceLevel {
    if (this.numberOfConfirmations < mode.low) {
      return assuranceLevels.LOW;
    }
    if (this.numberOfConfirmations < mode.medium) {
      return assuranceLevels.MEDIUM;
    }
    return assuranceLevels.HIGH;
  }
}
