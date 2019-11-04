// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import { groupBy, } from 'lodash';

import * as Tables from '../tables';
import type {
  AccountingTransactionInputRow,
  AccountingTransactionOutputRow,
  DbAccountingInputs, DbAccountingOutputs,
} from '../tables';
import type {
  TransactionRow,
} from '../../../primitives/tables';
import { getRowIn, } from '../../../utils';

export class GetAccountingInputs {
  static ownTables = Object.freeze({
    [Tables.AccountingTransactionInputSchema.name]: Tables.AccountingTransactionInputSchema,
  });
  static depTables = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<AccountingTransactionInputRow>>> {
    const table = GetAccountingInputs.ownTables[Tables.AccountingTransactionInputSchema.name];
    return await getRowIn<AccountingTransactionInputRow>(
      db, tx,
      table.name,
      table.properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<AccountingTransactionInputRow>>> {
    const table = GetAccountingInputs.ownTables[Tables.AccountingTransactionInputSchema.name];
    return await getRowIn<AccountingTransactionInputRow>(
      db, tx,
      table.name,
      table.properties.TransactionId,
      request.ids,
    );
  }
}

export class GetAccountingOutputs {
  static ownTables = Object.freeze({
    [Tables.AccountingTransactionOutputSchema.name]: Tables.AccountingTransactionOutputSchema,
  });
  static depTables = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<AccountingTransactionOutputRow>>> {
    const table = GetAccountingOutputs.ownTables[Tables.AccountingTransactionOutputSchema.name];
    return await getRowIn<AccountingTransactionOutputRow>(
      db, tx,
      table.name,
      table.properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<AccountingTransactionOutputRow>>> {
    const table = GetAccountingOutputs.ownTables[Tables.AccountingTransactionOutputSchema.name];
    return await getRowIn<AccountingTransactionOutputRow>(
      db, tx,
      table.name,
      table.properties.TransactionId,
      request.ids,
    );
  }
}

export class AssociateTxWithAccountingIOs {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetAccountingInputs,
    GetAccountingOutputs,
  });

  static async getTxIdsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      addressIds: Array<number>,
    },
  ): Promise<Array<number>> {
    const ins = await AssociateTxWithAccountingIOs.depTables.GetAccountingInputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    const outs = await AssociateTxWithAccountingIOs.depTables.GetAccountingOutputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    return Array.from(new Set([
      ...ins.map(input => input.TransactionId),
      ...outs.map(output => output.TransactionId),
    ]));
  }

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>,
    },
  ): Promise<Map<$ReadOnly<TransactionRow>, {| ...DbAccountingInputs, ...DbAccountingOutputs, |}>> {
    const ids = request.txs.map(transaction => transaction.TransactionId);

    const inputs = await AssociateTxWithAccountingIOs.depTables.GetAccountingInputs.fromTxIds(
      db, tx,
      { ids },
    );
    const outputs = await AssociateTxWithAccountingIOs.depTables.GetAccountingOutputs.fromTxIds(
      db, tx,
      { ids },
    );

    const groupedInput = groupBy(
      inputs,
      input => input.TransactionId,
    );
    const groupedOutput = groupBy(
      outputs,
      output => output.TransactionId,
    );

    const txMap = new Map();
    for (const transaction of request.txs) {
      txMap.set(transaction, {
        accountingInputs: groupedInput[transaction.TransactionId] || [],
        accountingOutputs: groupedOutput[transaction.TransactionId] || [],
      });
    }
    return txMap;
  }
}
