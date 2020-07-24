// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  BlockInsert,
  TransactionInsert,
  DbBlock,
} from '../../../primitives/tables';
import { TransactionType } from '../../../primitives/tables';
import type {
  JormungandrTxIO,
  CardanoByronTxIO,
  CardanoShelleyTxIO,
} from '../tables';
import type {
  UtxoTransactionInputInsert,
  UtxoTransactionOutputInsert,
} from '../../utxo/tables';
import type {
  AccountingTransactionInputInsert,
  AccountingTransactionOutputInsert,
} from '../../account/tables';
import { ModifyTransaction, ModifyCertificate, } from '../../../primitives/api/write';
import type { AddCertificateRequest } from '../../../primitives/api/write';
import { ModifyUtxoTransaction } from '../../utxo/api/write';
import { ModifyAccountingTransaction } from '../../account/api/write';

export class ModifyJormungandrTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyAccountingTransaction: typeof ModifyAccountingTransaction,
    ModifyCertificate: typeof ModifyCertificate,
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
    ModifyAccountingTransaction,
    ModifyCertificate,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
        accountingInputs: Array<AccountingTransactionInputInsert>,
        accountingOutputs: Array<AccountingTransactionOutputInsert>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...JormungandrTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyJormungandrTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
      accountingInputs, accountingOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyJormungandrTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    const accounting = await ModifyJormungandrTx.depTables.ModifyAccountingTransaction.addIOsToTx(
      db, tx, {
        accountingInputs, accountingOutputs,
      }
    );

    const certificates = [];
    for (const certGen of request.certificates) {
      const certRequest = certGen(newTx.transaction.TransactionId);
      if (certRequest != null) {
        certificates.push(await ModifyJormungandrTx.depTables.ModifyCertificate.addNew(
          db, tx,
          certRequest,
        ));
      }
    }

    return {
      txType: TransactionType.Jormungandr,
      ...newTx,
      certificates,
      ...utxo,
      ...accounting,
    };
  }
}

export class ModifyCardanoByronTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...CardanoByronTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyCardanoByronTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyCardanoByronTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    return {
      txType: TransactionType.CardanoByron,
      ...newTx,
      ...utxo,
    };
  }
}

export class ModifyCardanoShelleyTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyCertificate: typeof ModifyCertificate,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyCertificate,
    ModifyUtxoTransaction,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...CardanoShelleyTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyCardanoShelleyTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyCardanoShelleyTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );

    const certificates = [];
    for (const certGen of request.certificates) {
      const certRequest = certGen(newTx.transaction.TransactionId);
      if (certRequest != null) {
        certificates.push(await ModifyJormungandrTx.depTables.ModifyCertificate.addNew(
          db, tx,
          certRequest,
        ));
      }
    }

    return {
      txType: TransactionType.CardanoShelley,
      ...newTx,
      certificates,
      ...utxo,
    };
  }
}
