// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  BlockInsert,
  TransactionInsert,
  DbBlock, DbTransaction,
} from '../../../primitives/tables';
import type {
  UtxoTransactionInputInsert,
  UtxoTransactionOutputInsert,
  DbUtxoInputs, DbUtxoOutputs,
} from '../../utxo/tables';
import type {
  AccountingTransactionInputInsert,
  AccountingTransactionOutputInsert,
  DbAccountingInputs, DbAccountingOutputs,
} from '../../account/tables';
import { ModifyTransaction } from '../../../primitives/api/write';
import { ModifyUtxoTransaction } from '../../utxo/api/write';
import { ModifyAccountingTransaction } from '../../account/api/write';


export class ModifyMultipartTx {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
    ModifyAccountingTransaction,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
        accountingInputs: Array<AccountingTransactionInputInsert>,
        accountingOutputs: Array<AccountingTransactionOutputInsert>,
      |},
    },
  ): Promise<{|
    ...WithNullableFields<DbBlock>, ...DbTransaction,
    ...DbUtxoInputs, ...DbUtxoOutputs,
    ...DbAccountingInputs, ...DbAccountingOutputs,
    |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyMultipartTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
      accountingInputs, accountingOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyMultipartTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    const accounting = await ModifyMultipartTx.depTables.ModifyAccountingTransaction.addIOsToTx(
      db, tx, {
        accountingInputs, accountingOutputs,
      }
    );

    return {
      ...newTx,
      ...utxo,
      ...accounting,
    };
  }
}
