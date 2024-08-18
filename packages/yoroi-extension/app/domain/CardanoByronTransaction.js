// @flow
import type { UserAnnotation } from '../api/ada/transactions/types';
import type { CardanoByronTxIO } from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type { DbBlock, NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';
import { action } from 'mobx';
import WalletTransaction, { toAddr, } from './WalletTransaction';
import type { WalletTransactionCtorData } from './WalletTransaction';
import { MultiToken } from '../api/common/lib/MultiToken';

export default class CardanoByronTransaction extends WalletTransaction {
  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...CardanoByronTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry,
  |}): CardanoByronTransaction {
    const { addressLookupMap, defaultToken, tx } = request;

    return new CardanoByronTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.joinAddCopy(tx.fee),
      fee: tx.fee,
      date: tx.block != null ? tx.block.BlockTime : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken }),
        to: toAddr({
          rows: tx.utxoOutputs,
          addressLookupMap,
          tokens: tx.tokens,
          defaultToken,
        }).map(a => ({ ...a, isForeign: false })),
      },
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }

  @action
  static fromData(data: WalletTransactionCtorData): CardanoByronTransaction {
    return new CardanoByronTransaction(data);
  }
}

// fix BigNumber and MultiToken values after deserialization
export function deserializeTransactionCtorData(serializedData: Object): WalletTransactionCtorData {
  return {
    txid: serializedData.txid,
    block: null,
    type: serializedData.type,
    amount: MultiToken.from(serializedData.amount),
    fee: MultiToken.from(serializedData.fee),
    date: new Date(serializedData.date),
    addresses: {
      from: serializedData.addresses.from.map(({ address, value }) => ({
        address,
        value: MultiToken.from(value),
      })),
      to: serializedData.addresses.to.map(({ address, value }) => ({
        address,
        value: MultiToken.from(value),
      })),
    },
    state: serializedData.state,
    errorMsg: serializedData.errorMsg,
  };
}
