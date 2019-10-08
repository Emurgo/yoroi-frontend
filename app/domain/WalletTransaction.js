// @flow
import { action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import { LOVELACES_PER_ADA } from '../config/numbersConfig';
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

  @action
  static fromAnnotatedUtxoTx(request: {
    tx: {|
      ...DbTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    lastBlockNumber: null | number,
  }): WalletTransaction {
    const { addressLookupMap, tx } = request;

    const toAddr = rows => {
      const result  = [];
      for (const row of rows) {
        const val = addressLookupMap.get(row.AddressId);
        if (val == null) {
          throw new Error('fromAnnotatedUtxoTx address not in map');
        }
        result.push(val);
      }
      return result;
    };
    return new WalletTransaction({
      id: tx.transaction.Hash,
      type: tx.type,
      amount: tx.amount.dividedBy(LOVELACES_PER_ADA).plus(tx.fee.dividedBy(LOVELACES_PER_ADA)),
      fee: tx.fee.dividedBy(LOVELACES_PER_ADA),
      date: tx.block != null
        ? tx.block.BlockTime
        : new Date(tx.transaction.LastUpdateTime),
      numberOfConfirmations: request.lastBlockNumber != null && tx.block != null
        ? request.lastBlockNumber - tx.block.SlotNum
        : 0,
      addresses: {
        from: toAddr(tx.utxoInputs),
        to: toAddr(tx.utxoOutputs),
      },
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
