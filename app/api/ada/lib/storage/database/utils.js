// @flow

import type {
  lf$Database,
  lf$Row
} from 'lovefield';

export type AddRowRequest<T> = {
  db: lf$Database,
  row: T,
};

export async function addToTable<Insert, Row>(
  request: AddRowRequest<Insert>,
  tableName: string,
): Promise<Row> {
  const table = request.db.getSchema().table(tableName);
  const newRow = table.createRow(request.row);

  const result: Row = (await request.db
    .insertOrReplace()
    .into(table)
    .values(([newRow]: Array<lf$Row>))
    .exec())[0];

  return result;
}

export const getRowFromKey = async <T>(
  db: lf$Database,
  key: number,
  tableName: string,
  keyRowName: string,
): Promise<T | typeof undefined> => {
  const table = db.getSchema().table(tableName);
  const query = db
    .select()
    .from(table)
    .where(table[keyRowName].eq(key));
  const result = await query.exec();
  if (result.length === 0) {
    return undefined;
  }
  return result[0];
};

export async function getRowIn<Row>(
  db: lf$Database,
  tableName: string,
  keyRowName: string,
  list: Array<any>,
): Promise<Array<Row>> {
  const table = db.getSchema().table(tableName);
  const query = db
    .select()
    .from(table)
    .where(table[keyRowName].in(list));
  return await query.exec();
}
