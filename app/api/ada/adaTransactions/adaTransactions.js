// @flow
import LovefieldDB from '../lib/lovefieldDatabase';

export async function getAdaTransactions() {
  const db = LovefieldDB.db;
  const txsTable = db.getSchema().table('Txs');
  return await db.select()
    .from(txsTable)
    .orderBy(txsTable[LovefieldDB.txsTableFields.CTM_DATE], LovefieldDB.orders.DESC)
    .exec()
    .then(rows => rows);
}

