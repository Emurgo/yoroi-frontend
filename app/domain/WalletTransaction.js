// @flow
import { computed, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type { PriceDataRow } from '../api/ada/lib/storage/database/prices/tables';
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssuranceTypes';
import { assuranceLevels } from '../config/transactionAssuranceConfig';
import type {
  TransactionDirectionType,
} from '../api/ada/transactions/types';
import type {
  BlockRow,
  DbTokenInfo,
} from '../api/ada/lib/storage/database/primitives/tables';
import type {
  TxStatusCodesType,
} from '../api/ada/lib/storage/database/primitives/enums';
import { transactionTypes } from '../api/ada/transactions/types';
import type { UnconfirmedAmount } from '../types/unconfirmedAmountType';
import {
  MultiToken,
} from '../api/common/lib/MultiToken';
import type {
  DefaultTokenEntry,
} from '../api/common/lib/MultiToken';

export type TransactionAddresses = {|
  from: Array<{|
    address: string,
    value: MultiToken,
  |}>,
  to: Array<{|
    address: string,
    value: MultiToken,
  |}>,
|};

export type WalletTransactionCtorData = {|
  txid: string,
  block: ?$ReadOnly<BlockRow>,
  type: TransactionDirectionType,
  amount: MultiToken,
  fee: MultiToken,
  date: Date,
  addresses: TransactionAddresses,
  state: TxStatusCodesType,
  errorMsg: null | string,
|};

export default class WalletTransaction {

  @observable txid: string;

  // TODO: remove and make as a map
  @observable block: ?$ReadOnly<BlockRow>;
  @observable type: TransactionDirectionType;
  @observable amount: MultiToken; // fee included
  @observable fee: MultiToken;
  @observable date: Date; // TODO: remove?
  @observable addresses: TransactionAddresses = { from: [], to: [] };

  // TODO: remove and turn it into a map
  @observable state: TxStatusCodesType;
  @observable errorMsg: null | string;

  constructor(data: WalletTransactionCtorData) {
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
}

export function calculateUnconfirmedAmount(
  transactions: Array<WalletTransaction>,
  lastSyncBlock: number,
  assuranceMode: AssuranceMode,
  getUnitOfAccount: Date => (void | $ReadOnly<PriceDataRow>),
  defaultTokenInfo: DefaultTokenEntry,
): UnconfirmedAmount {
  const unconfirmedAmount = {
    total: new MultiToken([], defaultTokenInfo),
    incoming: new MultiToken([], defaultTokenInfo),
    outgoing: new MultiToken([], defaultTokenInfo),
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
      unconfirmedAmount.total.joinAddMutable(transaction.amount.absCopy());

      // outgoing
      if (transaction.type === transactionTypes.EXPEND) {
        unconfirmedAmount.outgoing = unconfirmedAmount.outgoing.joinAddMutable(
          transaction.amount.absCopy()
        );
        const unitOfAccount = getUnitOfAccount(transaction.date);
        if (unitOfAccount != null) {
          if (unconfirmedAmount.outgoingInSelectedCurrency) {
            unconfirmedAmount.outgoingInSelectedCurrency =
              unconfirmedAmount.outgoingInSelectedCurrency.plus(
                transaction.amount
                  .getDefault()
                  .absoluteValue()
                  .multipliedBy(String(unitOfAccount.Price))
              );
          } else {
            unconfirmedAmount.outgoingInSelectedCurrency = null;
          }
        }
      }

      // incoming
      if (transaction.type === transactionTypes.INCOME) {
        unconfirmedAmount.incoming = unconfirmedAmount.incoming.joinAddMutable(
          transaction.amount.absCopy()
        );
        const unitOfAccount = getUnitOfAccount(transaction.date);
        if (unitOfAccount != null) {
          if (unconfirmedAmount.incomingInSelectedCurrency) {
            unconfirmedAmount.incomingInSelectedCurrency =
              unconfirmedAmount.incomingInSelectedCurrency.plus(
                transaction.amount
                  .getDefault()
                  .absoluteValue()
                  .multipliedBy(String(unitOfAccount.Price))
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

export const toAddr: {|
  rows: $ReadOnlyArray<$ReadOnly<{
    +AddressId: number,
    +TokenListId: number,
    ...,
  }>>,
  addressLookupMap: Map<number, string>,
  tokens: $PropertyType<DbTokenInfo, 'tokens'>,
  defaultToken: DefaultTokenEntry
|} => Array<{|
  address: string,
  value: MultiToken,
|}> = request => {
  const result = [];
  for (const row of request.rows) {
    const val = request.addressLookupMap.get(row.AddressId);
    if (val == null) {
      throw new Error(`${nameof(toAddr)} address not in map`);
    }
    const tokens = new MultiToken([], request.defaultToken);
    for (const token of request.tokens) {
      if (token.TokenList.ListId === row.TokenListId) {
        tokens.add({
          identifier: token.Token.Identifier,
          amount: new BigNumber(token.TokenList.Amount),
          networkId: token.Token.NetworkId,
        });
      }
    }
    result.push({
      address: val,
      value: tokens,
    });
  }
  return result;
};
