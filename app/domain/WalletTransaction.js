// @flow
import { observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssuranceTypes';
import { assuranceLevels } from '../config/transactionAssuranceConfig';

export type TrasactionAddresses = { from: Array<string>, to: Array<string> };
export type TransactionState = 'pending' | 'failed' | 'ok';
export type TransactionType = 'card' | 'expend' | 'income' | 'exchange' | 'self' | 'multi';

export const transactionStates: {
  PENDING: TransactionState,
  FAILED: TransactionState,
  OK: TransactionState,
} = {
  PENDING: 'pending',
  FAILED: 'failed',
  OK: 'ok',
};

export const transactionTypes: {
  EXPEND: TransactionType,
  INCOME: TransactionType,
  EXCHANGE: TransactionType,
  SELF: TransactionType,
  MULTI: TransactionType
} = {
  EXPEND: 'expend',
  INCOME: 'income',
  EXCHANGE: 'exchange',
  SELF: 'self',
  MULTI: 'multi'
};

export default class WalletTransaction {

  @observable id: string = '';
  @observable type: TransactionType;
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
    type: TransactionType,
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
