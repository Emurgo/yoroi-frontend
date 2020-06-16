// @flow
import { action, computed, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type { PriceDataRow } from '../api/ada/lib/storage/database/prices/tables';
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssuranceTypes';
import { assuranceLevels } from '../config/transactionAssuranceConfig';
import type {
  TransactionDirectionType,
  UserAnnotation,
} from '../api/ada/transactions/types';
import type {
  DbTxIO,
} from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock, CertificatePart, BlockRow,
} from '../api/ada/lib/storage/database/primitives/tables';
import type {
  TxStatusCodesType,
} from '../api/ada/lib/storage/database/primitives/enums';
import { transactionTypes } from '../api/ada/transactions/types';
import type { UnconfirmedAmount } from '../types/unconfirmedAmountType';
import type { ApiOptionType } from '../api/common/utils';
import { getApiMeta } from '../api/common/utils';

export type TransactionAddresses = {|
  from: Array<{|
    address: string,
    value: BigNumber,
  |}>,
  to: Array<{|
    address: string,
    value: BigNumber,
  |}>,
|};

export default class WalletTransaction {

  @observable txid: string;

  // TODO: remove and make as a map
  @observable block: ?$ReadOnly<BlockRow>;
  @observable type: TransactionDirectionType;
  @observable amount: BigNumber; // fee included
  @observable fee: BigNumber;
  @observable date: Date; // TODO: remove?
  @observable addresses: TransactionAddresses = { from: [], to: [] };
  @observable certificate: void | CertificatePart;

  // TODO: remove and turn it into a map
  @observable state: TxStatusCodesType;
  @observable errorMsg: null | string;

  constructor(data: {|
    txid: string,
    block: ?$ReadOnly<BlockRow>,
    type: TransactionDirectionType,
    amount: BigNumber,
    fee: BigNumber,
    date: Date,
    addresses: TransactionAddresses,
    certificate: void | CertificatePart,
    state: TxStatusCodesType,
    errorMsg: null | string,
  |}) {
    Object.assign(this, data);
  }

  /**
   * get a unique key for the transaction state
   * can be used as a key for a React element or to trigger a mobx reaction
   */
  @computed get uniqueKey(): string {
    const hash = this.block == null
      ? 'undefined'
      : this.block.Hash;
    return `${this.txid}-${this.state}-${hash}`;
  }

  getAssuranceLevelForMode(
    mode: AssuranceMode,
    absoluteBlockNum: number,
  ): AssuranceLevel {
    if (this.block == null) {
      // TODO: this is slightly unexpected behavior in order to return non-null
      // maybe we shouldn't do this
      return assuranceLevels.LOW;
    }
    if (absoluteBlockNum - this.block.Height < mode.low) {
      return assuranceLevels.LOW;
    }
    if (absoluteBlockNum - this.block.Height < mode.medium) {
      return assuranceLevels.MEDIUM;
    }
    return assuranceLevels.HIGH;
  }

  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...DbTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    api: ApiOptionType,
  |}): WalletTransaction {
    const apiMeta = getApiMeta(request.api)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(WalletTransaction)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const { addressLookupMap, tx } = request;

    const toAddr = rows => {
      const result: Array<{|
        address: string,
        value: BigNumber,
      |}> = [];
      for (const row of rows) {
        const val = addressLookupMap.get(row.AddressId);
        if (val == null) {
          throw new Error(`${nameof(WalletTransaction.fromAnnotatedTx)} address not in map`);
        }
        result.push({
          address: val,
          value: new BigNumber(row.Amount).dividedBy(amountPerUnit),
        });
      }
      return result;
    };

    return new WalletTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.dividedBy(amountPerUnit).plus(tx.fee.dividedBy(amountPerUnit)),
      fee: tx.fee.dividedBy(amountPerUnit),
      date: tx.block != null
        ? tx.block.BlockTime
        : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: [
          ...toAddr(tx.utxoInputs),
          ...toAddr(tx.accountingInputs),
        ],
        to: [
          ...toAddr(tx.utxoOutputs),
          ...toAddr(tx.accountingOutputs),
        ]
      },
      certificate: tx.certificate,
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}

export function calculateUnconfirmedAmount(
  transactions: Array<WalletTransaction>,
  lastSyncBlock: number,
  assuranceMode: AssuranceMode,
  getUnitOfAccount: Date => (void | $ReadOnly<PriceDataRow>),
): UnconfirmedAmount {
  const unconfirmedAmount = {
    total: new BigNumber(0),
    incoming: new BigNumber(0),
    outgoing: new BigNumber(0),
    // If any of the below values becomes null, it means price data are
    // unavailable for at least one of the transaction in the category
    // and we just give up calculating the value.
    incomingInSelectedCurrency: new BigNumber(0),
    outgoingInSelectedCurrency: new BigNumber(0),
  };

  for (const transaction of transactions) {
    // skip any failed transactions
    if (transaction.state < 0) continue;

    const assuranceForTx = transaction.getAssuranceLevelForMode(assuranceMode, lastSyncBlock);
    if (assuranceForTx !== assuranceLevels.HIGH) {
      // total
      unconfirmedAmount.total = unconfirmedAmount.total.plus(transaction.amount.absoluteValue());

      // outgoing
      if (transaction.type === transactionTypes.EXPEND) {
        unconfirmedAmount.outgoing = unconfirmedAmount.outgoing.plus(
          transaction.amount.absoluteValue()
        );
        const unitOfAccount = getUnitOfAccount(transaction.date);
        if (unitOfAccount != null) {
          if (unconfirmedAmount.outgoingInSelectedCurrency) {
            unconfirmedAmount.outgoingInSelectedCurrency =
              unconfirmedAmount.outgoingInSelectedCurrency.plus(
                transaction.amount.absoluteValue().multipliedBy(String(unitOfAccount.Price))
              );
          } else {
            unconfirmedAmount.outgoingInSelectedCurrency = null;
          }
        }
      }

      // incoming
      if (transaction.type === transactionTypes.INCOME) {
        unconfirmedAmount.incoming = unconfirmedAmount.incoming.plus(
          transaction.amount.absoluteValue()
        );
        const unitOfAccount = getUnitOfAccount(transaction.date);
        if (unitOfAccount != null) {
          if (unconfirmedAmount.incomingInSelectedCurrency) {
            unconfirmedAmount.incomingInSelectedCurrency =
              unconfirmedAmount.incomingInSelectedCurrency.plus(
                transaction.amount.absoluteValue().multipliedBy(String(unitOfAccount.Price))
              );
          } else {
            unconfirmedAmount.incomingInSelectedCurrency = null;
          }
        }
      }
    }
  }

  return unconfirmedAmount;
}
