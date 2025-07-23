// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import { op } from 'lovefield';
import {
  addOrReplaceRow, addNewRowToTable, removeFromTableBatch,
} from '../../utils';
import * as Tables from '../tables';
import type {
  UtxoAtSafePoint,
  UtxoAtSafePointInsert,
  UtxoAtSafePointRow,
  UtxoDiffToBestBlock,
  UtxoDiffToBestBlockInsert,
  UtxoDiffToBestBlockRow,
} from '../tables';
import { GetUtxoAtSafePoint, GetUtxoDiffToBestBlock } from './read';

export class ModifyUtxoAtSafePoint {
  static ownTables: {|
    UtxoAtSafePointTable: typeof Tables.UtxoAtSafePointSchema,
  |} = Object.freeze({
    [Tables.UtxoAtSafePointSchema.name]: Tables.UtxoAtSafePointSchema,
  });

  static depTables: {||} = Object.freeze({});

  static async addOrReplace(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
    utxoAtSafePoint: UtxoAtSafePoint
  ): Promise<void> {
    const row = await GetUtxoAtSafePoint.forWallet(db, tx, publicDeriverId);
    if (row) {
      const newRow: UtxoAtSafePointRow = {
        UtxoAtSafePointId: row.UtxoAtSafePointId,
        PublicDeriverId: publicDeriverId,
        UtxoAtSafePoint: utxoAtSafePoint,
      };
      await addOrReplaceRow<UtxoAtSafePointRow, UtxoAtSafePointRow>(
        db, tx,
        newRow,
        ModifyUtxoAtSafePoint.ownTables[Tables.UtxoAtSafePointSchema.name].name,
      );
    } else {
      await addNewRowToTable<UtxoAtSafePointInsert, UtxoAtSafePointRow>(
        db, tx,
        {
          PublicDeriverId: publicDeriverId,
          UtxoAtSafePoint: utxoAtSafePoint,
        },
        ModifyUtxoAtSafePoint.ownTables[Tables.UtxoAtSafePointSchema.name].name,
      );
    }
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
  ): Promise<void> {
    await removeFromTableBatch(
      db, tx,
      ModifyUtxoAtSafePoint.ownTables[Tables.UtxoAtSafePointSchema.name].name,
      ModifyUtxoAtSafePoint.ownTables[Tables.UtxoAtSafePointSchema.name].properties.PublicDeriverId,
      ([publicDeriverId]: Array<number>),
    );
  }
}

export class ModifyUtxoDiffToBestBlock {
  static ownTables: {|
    UtxoDiffToBestBlock: typeof Tables.UtxoDiffToBestBlockSchema,
  |} = Object.freeze({
    [Tables.UtxoDiffToBestBlockSchema.name]: Tables.UtxoDiffToBestBlockSchema,
  });

  static depTables: {||} = Object.freeze({});

  static async removeAll(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
  ): Promise<void> {
    const schema = ModifyUtxoDiffToBestBlock.ownTables[Tables.UtxoDiffToBestBlockSchema.name];
    const tableName = schema.name;
    const fieldNames = schema.properties;
    const table = db.getSchema().table(tableName);
    await tx.attach(
      db.delete().from(table)
        .where(table[fieldNames.PublicDeriverId].eq(publicDeriverId))
    );
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
    lastBestBlockHash: string,
  ): Promise<void> {
    const schema = ModifyUtxoDiffToBestBlock.ownTables[Tables.UtxoDiffToBestBlockSchema.name];
    const tableName = schema.name;
    const fieldNames = schema.properties;
    const table = db.getSchema().table(tableName);
    await tx.attach(
      db.delete().from(table)
        .where(
          op.and(
            table[fieldNames.PublicDeriverId].eq(publicDeriverId),
            table[fieldNames.lastBestBlockHash].eq(lastBestBlockHash)
          )
        )
    );
  }

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
    utxoDiffToBestBlock: UtxoDiffToBestBlock,
  ): Promise<void> {
    // Do nothing if a row with `utxoDiffToBestBlock.lastBestBlockHash` is already
    // present. But we can't rely on the unique index because the exception is
    // thrown when the tx is being committed and there is no way to catch it
    // only for this query.
    const existing = await GetUtxoDiffToBestBlock.findLastBestBlockHash(
      db, tx,
      publicDeriverId,
      utxoDiffToBestBlock.lastBestBlockHash
    );

    if (!existing) {
      await addNewRowToTable<UtxoDiffToBestBlockInsert, UtxoDiffToBestBlockRow>(
        db, tx,
        {
          PublicDeriverId: publicDeriverId,
          lastBestBlockHash: utxoDiffToBestBlock.lastBestBlockHash,
          spentUtxoIds: utxoDiffToBestBlock.spentUtxoIds,
          newUtxos: utxoDiffToBestBlock.newUtxos,
        },
        ModifyUtxoDiffToBestBlock.ownTables[Tables.UtxoDiffToBestBlockSchema.name].name,
      );
    }
  }
}
