// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  TransactionRow,
} from '../../../primitives/tables';
import { TransactionType } from '../../../primitives/tables';
import { GetCertificates, } from '../../../primitives/api/read';
import type { CardanoByronTxIO, CardanoShelleyTxIO, JormungandrTxIO } from '../tables';

import {
  AssociateTxWithAccountingIOs,
} from '../../account/api/read';
import {
  AssociateTxWithUtxoIOs,
} from '../../utxo/api/read';

const getOrThrow = function<T> (input: T | void): T {
  if (input == null) throw new Error(`${nameof(getOrThrow)} no tx part found. Should never happen`);
  return input;
};

export class CardanoByronAssociateTxWithIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    AssociateTxWithUtxoIOs: typeof AssociateTxWithUtxoIOs,
  |} = Object.freeze({
    AssociateTxWithUtxoIOs,
  });

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>, |},
  ): Promise<Array<CardanoByronTxIO>> {
    const utxo = await CardanoByronAssociateTxWithIOs.depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, request
    );

    const fullTx = request.txs.map(transaction  => ({
      txType: TransactionType.CardanoByron,
      transaction,
      ...getOrThrow(utxo.get(transaction)),
    }));
    return fullTx;
  }
}

export class JormungandrAssociateTxWithIOs {
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

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>, |},
  ): Promise<Array<JormungandrTxIO>> {
    const { depTables } = JormungandrAssociateTxWithIOs;
    const accounting = await depTables.AssociateTxWithAccountingIOs.getIOsForTx(
      db, tx, request
    );
    const utxo = await depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, request
    );

    const certsForTxs = await depTables.GetCertificates.forTransactions(
      db, tx,
      { txIds: request.txs.map(transaction => transaction.TransactionId) },
    );
    const fullTx = request.txs.map(transaction  => ({
      txType: TransactionType.Jormungandr,
      transaction,
      certificates: certsForTxs.get(transaction.TransactionId) ?? [],
      ...getOrThrow(utxo.get(transaction)),
      ...getOrThrow(accounting.get(transaction)),
    }));
    return fullTx;
  }
}

export class CardanoShelleyAssociateTxWithIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    AssociateTxWithUtxoIOs: typeof AssociateTxWithUtxoIOs,
    GetCertificates: typeof GetCertificates,
    AssociateTxWithAccountingIOs: typeof AssociateTxWithAccountingIOs,
  |} = Object.freeze({
    AssociateTxWithUtxoIOs,
    GetCertificates,
    AssociateTxWithAccountingIOs,
  });

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>, |},
  ): Promise<Array<CardanoShelleyTxIO>> {
    const { depTables } = CardanoShelleyAssociateTxWithIOs;
    const utxo = await depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, request
    );
    const accounting = await depTables.AssociateTxWithAccountingIOs.getIOsForTx(
      db, tx, request
    );

    const certsForTxs = await depTables.GetCertificates.forTransactions(
      db, tx,
      { txIds: request.txs.map(transaction => transaction.TransactionId) },
    );

    const fullTx = request.txs.map(transaction  => ({
      txType: TransactionType.CardanoByron,
      transaction,
      certificates: certsForTxs.get(transaction.TransactionId) ?? [],
      ...getOrThrow(utxo.get(transaction)),
      accountingInputs: getOrThrow(accounting.get(transaction)).accountingInputs,
    }));
    return fullTx;
  }
}
