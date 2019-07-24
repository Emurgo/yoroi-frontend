// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  ConceptualWalletRow,
  KeyRow,
} from '../tables';
import * as Tables from '../tables';
import { getRowFromKey } from '../../utils';
import { Bip44WrapperSchema, } from '../../genericBip44/tables';
import type { Bip44WrapperRow } from '../../genericBip44/tables';

export class GetConceptualWallet {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<ConceptualWalletRow | void> {
    const walletSchema = GetConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name];
    return await getRowFromKey<ConceptualWalletRow>(
      db, tx,
      key,
      walletSchema.name,
      walletSchema.properties.ConceptualWalletId,
    );
  }
}

export class GetKey {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<KeyRow | void> {
    return await getRowFromKey<KeyRow>(
      db, tx,
      key,
      GetKey.ownTables[Tables.KeySchema.name].name,
      GetKey.ownTables[Tables.KeySchema.name].properties.KeyId,
    );
  }
}

const WalletType = Object.freeze({
  Bip44: 'bip44',
});
export class GetWalletByType {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema,
    [Bip44WrapperSchema.name]: Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async func<T>(
    db: lf$Database,
    tx: lf$Transaction,
    type: $Values<typeof WalletType>,
  ): Promise<Array<T & {
    ConceptualWallet: ConceptualWalletRow,
  }>> {
    const walletSchema = GetWalletByType.ownTables[Tables.ConceptualWalletSchema.name];
    const conceptualWalletTable = db.getSchema().table(
      walletSchema.name
    );
    const keyRowName = walletSchema.properties.ConceptualWalletId;

    let tableName;
    if (type === WalletType.Bip44) {
      tableName = GetWalletByType.ownTables[Bip44WrapperSchema.name].name;
    } else {
      throw new Error('WalletType::func unexpected type');
    }
    const typeTable = db.getSchema().table(tableName);
    return await tx.attach(db
      .select()
      .from(conceptualWalletTable)
      .innerJoin(
        typeTable,
        typeTable[keyRowName].eq(conceptualWalletTable[keyRowName]),
      ));
  }
}

export class GetAllBip44Wallets {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetWalletByType,
  });

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<Array<{
    ConceptualWallet: ConceptualWalletRow,
    Bip44Wrapper: Bip44WrapperRow,
  }>> {
    return GetWalletByType.func<{Bip44Wrapper: Bip44WrapperRow}>(
      db, tx,
      WalletType.Bip44,
    );
  }
}
