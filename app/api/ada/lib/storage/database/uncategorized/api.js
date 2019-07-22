

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  KeyInsert, KeyRow,
  ConceptualWalletInsert, ConceptualWalletRow,
} from './tables';
import * as Tables from './tables';
import { addToTable, getRowFromKey } from '../utils';
import type { AddRowRequest } from '../utils';
import { Bip44WrapperSchema, } from '../genericBip44/tables';
import type { Bip44WrapperRow } from '../genericBip44/tables';

// =======
//   Add
// =======


export const addKey = async (
  db: lf$Database,
  tx: lf$Transaction,
  request: AddRowRequest<KeyInsert>,
): Promise<KeyRow> => (
  await addToTable<KeyInsert, KeyRow>(
    db, tx,
    request, Tables.KeySchema.name
  )
);
export const addConceptualWallet = async (
  db: lf$Database,
  tx: lf$Transaction,
  request: AddRowRequest<ConceptualWalletInsert>,
): Promise<ConceptualWalletRow> => (
  await addToTable<ConceptualWalletInsert, ConceptualWalletRow>(
    db, tx,
    request, Tables.ConceptualWalletSchema.name
  )
);

// =======
//   Get
// =======

export const getConceptualWallet = async (
  db: lf$Database,
  tx: lf$Transaction,
  key: number,
): Promise<ConceptualWalletRow | typeof undefined> => (
  await getRowFromKey<ConceptualWalletRow>(
    db,
    tx,
    key,
    Tables.ConceptualWalletSchema.name,
    Tables.ConceptualWalletSchema.properties.ConceptualWalletId,
  )
);

const WalletType = Object.freeze({
  Bip44: 'bip44',
});

const getWalletByType = async <T>(
  db: lf$Database,
  type: $Values<typeof WalletType>,
): Promise<Array<T & {
  ConceptualWallet: ConceptualWalletRow,
}>> => {
  const conceptualWalletTable = db.getSchema().table(Tables.ConceptualWalletSchema.name);
  const keyRowName = Tables.ConceptualWalletSchema.properties.ConceptualWalletId;

  let tableName;
  if (type === WalletType.Bip44) {
    tableName = Bip44WrapperSchema.name;
  } else {
    throw new Error('unexpected type');
  }
  const typeTable = db.getSchema().table(tableName);
  return await db
    .select()
    .from(conceptualWalletTable)
    .innerJoin(
      typeTable,
      typeTable[keyRowName].eq(conceptualWalletTable[keyRowName]),
    ).exec();
};

export const getAllBip44Wallets = async (
  db: lf$Database,
): Promise<Array<{
  ConceptualWallet: ConceptualWalletRow,
  Bip44Wrapper: Bip44WrapperRow,
}>> => (
  getWalletByType<{Bip44Wrapper: Bip44WrapperRow, }>(
    db,
    WalletType.Bip44,
  )
);
