// @flow
import { action, observable } from 'mobx';
import BigNumber from 'bignumber.js';
import type {
  UserAnnotation,
} from '../api/ada/transactions/types';
import type {
  JormungandrTxIO,
} from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  CertificatePart,
} from '../api/ada/lib/storage/database/primitives/tables';
import type { ApiOptionType } from '../api/common/utils';
import { getApiMeta } from '../api/common/utils';
import WalletTransaction, { toAddr } from './WalletTransaction';
import type { WalletTransactionCtorData } from './WalletTransaction';

export default class JormungandrTransaction extends WalletTransaction {

  @observable certificates: Array<CertificatePart>;

  constructor(data: {|
    ...WalletTransactionCtorData,
    certificates: Array<CertificatePart>,
  |}) {
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
    api: ApiOptionType,
  |}): JormungandrTransaction {
    const apiMeta = getApiMeta(request.api)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(JormungandrTransaction)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const { addressLookupMap, tx } = request;

    return new JormungandrTransaction({
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
          ...toAddr({ rows: tx.utxoInputs, amountPerUnit, addressLookupMap }),
          ...toAddr({ rows: tx.accountingInputs, amountPerUnit, addressLookupMap }),
        ],
        to: [
          ...toAddr({ rows: tx.utxoOutputs, amountPerUnit, addressLookupMap }),
          ...toAddr({ rows: tx.accountingOutputs, amountPerUnit, addressLookupMap }),
        ],
      },
      certificates: tx.certificates,
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
