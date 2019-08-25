// @flow
import { observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssuranceTypes';
import { assuranceLevels } from '../config/transactionAssuranceConfig';
import type {
  TransactionDirectionType,
  UserAnnotation,
} from '../api/ada/adaTypes';
import type {
  TxStatusCodesType,
  DbTxIO,
} from '../api/ada/lib/storage/database/transactions/tables';
import type { DbBlock, } from '../api/ada/lib/storage/database/uncategorized/tables';

export type TrasactionAddresses = { from: Array<string>, to: Array<string> };

export default class WalletTransaction {

  @observable id: string = '';
  @observable type: TransactionDirectionType;
  @observable amount: BigNumber; // fee included
  @observable fee: BigNumber;
  @observable date: Date;
  @observable numberOfConfirmations: number = 0;
  @observable addresses: TrasactionAddresses = { from: [], to: [] };
  @observable state: TxStatusCodesType;
  @observable errorMsg: null | string;

  constructor(data: {
    id: string,
    type: TransactionDirectionType,
    amount: BigNumber,
    fee: BigNumber,
    date: Date,
    numberOfConfirmations: number,
    addresses: TrasactionAddresses,
    state: TxStatusCodesType,
    errorMsg: null | string,
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

  static fromAnnotatedUtxoTx(request: {
    data: {|
      ...DbTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    lastBlockNumber: null | number,
  }): WalletTransaction {
    const { data } = request;
    return new WalletTransaction({
      id: data.transaction.TransactionId.toString(),
      type: data.type,
      amount: data.amount,
      fee: data.fee,
      date: data.block != null
        ? data.block.BlockTime
        : new Date(data.transaction.LastUpdateTime),
      numberOfConfirmations: request.lastBlockNumber != null && data.block != null
        ? request.lastBlockNumber - data.block.SlotNum
        : 0,
      addresses: {
        from: [],
        to: [],
      },
      state: data.transaction.Status,
      errorMsg: data.transaction.ErrorMessage,
    });
  }
}
