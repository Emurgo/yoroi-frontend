// @flow
import type { AssuranceMode, AssuranceLevel } from '../types/transactionAssurance.types';
import type { TransactionDirectionType } from '../api/ada/transactions/types';
import type { BlockRow, DbTokenInfo } from '../api/ada/lib/storage/database/primitives/tables';
import type { TxStatusCodesType } from '../api/ada/lib/storage/database/primitives/enums';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';
import type { TxDataOutput, TxDataInput } from '../api/common/types';
import { computed, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import { assuranceLevels } from '../config/transactionAssuranceConfig';
import { MultiToken } from '../api/common/lib/MultiToken';

export type TransactionAddresses = {|
  from: Array<TxDataInput>,
  to: Array<TxDataOutput>,
|};

export type WalletTransactionCtorData = {|
  txid: string,
  block: ?$ReadOnly<BlockRow>,
  type: TransactionDirectionType,
  amount: MultiToken,
  fee: MultiToken,
  date: Date,
  ordinal?: ?number,
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
  @observable date: Date;
  @observable ordinal: ?number;
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
    const hash = this.block == null ? 'undefined' : this.block.Hash;
    return `${this.txid}-${this.state}-${hash}`;
  }

  getAssuranceLevelForMode(mode: AssuranceMode, absoluteBlockNum: number): AssuranceLevel {
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

export const toAddr: ({|
  rows: $ReadOnlyArray<
    $ReadOnly<{
      +AddressId: number,
      +TokenListId: number,
      ...
    }>
  >,
  addressLookupMap: Map<number, string>,
  tokens: $PropertyType<DbTokenInfo, 'tokens'>,
  defaultToken: DefaultTokenEntry,
|}) => Array<TxDataInput> = request => {
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
