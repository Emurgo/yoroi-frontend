// @flow
import type { UserAnnotation } from '../api/ada/transactions/types';
import type { JormungandrTxIO } from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  CertificatePart,
  NetworkRow,
} from '../api/ada/lib/storage/database/primitives/tables';
import type { WalletTransactionCtorData } from './WalletTransaction';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';
import { action, observable } from 'mobx';
import WalletTransaction, { toAddr } from './WalletTransaction';

export default class JormungandrTransaction extends WalletTransaction {
  @observable certificates: Array<CertificatePart>;

  constructor(data: {| ...WalletTransactionCtorData, certificates: Array<CertificatePart> |}) {
    const { certificates, ...rest } = data;
    super(rest);
    this.certificates = certificates;
  }

  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...JormungandrTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry,
  |}): JormungandrTransaction {
    const { addressLookupMap, defaultToken, tx } = request;

    return new JormungandrTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.joinAddCopy(tx.fee),
      fee: tx.fee,
      date: tx.block != null ? tx.block.BlockTime : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: [
          ...toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken }),
          ...toAddr({
            rows: tx.accountingInputs,
            addressLookupMap,
            tokens: tx.tokens,
            defaultToken,
          }),
        ],
        to: [
          ...toAddr({ rows: tx.utxoOutputs, addressLookupMap, tokens: tx.tokens, defaultToken }),
          ...toAddr({
            rows: tx.accountingOutputs,
            addressLookupMap,
            tokens: tx.tokens,
            defaultToken,
          }),
        ].map(a => ({ ...a, isForeign: false })),
      },
      certificates: tx.certificates,
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
