// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  TransactionRow,
} from '../../../primitives/tables';
import { GetCertificates, } from '../../../primitives/api/read';
import type { DbTxIO } from '../tables';

import {
  AssociateTxWithAccountingIOs,
} from '../../account/api/read';
import {
  AssociateTxWithUtxoIOs,
} from '../../utxo/api/read';

export class AssociateTxWithIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    AssociateTxWithAccountingIOs: typeof AssociateTxWithAccountingIOs,
    AssociateTxWithUtxoIOs: typeof AssociateTxWithUtxoIOs,
    GetCertificates: typeof GetCertificates,
  |} = Object.freeze({
    AssociateTxWithAccountingIOs,
    AssociateTxWithUtxoIOs,
    GetCertificates,
  });

  static async getTxIdsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      utxoAddressIds: Array<number>,
      accountingAddressIds: Array<number>,
    |},
  ): Promise<Array<number>> {
    return Array.from(new Set([
      ...(await AssociateTxWithIOs.depTables.AssociateTxWithAccountingIOs.getTxIdsForAddresses(
        db, tx, { addressIds: request.accountingAddressIds },
      )),
      ...(await AssociateTxWithIOs.depTables.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
        db, tx, { addressIds: request.utxoAddressIds },
      )),
    ]));
  }

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>, |},
  ): Promise<Array<DbTxIO>> {
    const accounting = await AssociateTxWithIOs.depTables.AssociateTxWithAccountingIOs.getIOsForTx(
      db, tx, request
    );
    const utxo = await AssociateTxWithIOs.depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, request
    );

    const getOrThrow = function<T> (input: T | void): T {
      if (input == null) throw new Error('getIOsForTx no tx part found. Should never happen');
      return input;
    };

    const certsForTxs = await AssociateTxWithIOs.depTables.GetCertificates.forTransactions(
      db, tx,
      { txIds: request.txs.map(transaction => transaction.TransactionId) },
    );
    const fullTx = request.txs.map(transaction  => ({
      transaction,
      certificates: certsForTxs.get(transaction.TransactionId) ?? [],
      ...getOrThrow(utxo.get(transaction)),
      ...getOrThrow(accounting.get(transaction)),
    }));
    return fullTx;
  }
}
