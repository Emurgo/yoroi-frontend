// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Cip1852WrapperInsert, Cip1852WrapperRow,
  Cip1852ToPublicDeriverInsert, Cip1852ToPublicDeriverRow,
} from '../tables';
import * as Cip1852Tables from '../tables';
import {
  GetAllCip1852Wallets,
  GetCip1852Wrapper,
} from './read';

import {
  GetCip1852Tables,
} from './utils';
import { addNewRowToTable, StaleStateError, } from '../../../utils';
import type { AddPublicDeriverResponse } from '../../core/api/write';
import { DerivePublicDeriverFromKey, AddAdhocPublicDeriver, } from '../../common/api/write';
import type {
  DerivePublicDeriverFromKeyRequest,
  AddAdhocPublicDeriverRequest,
  AddAdhocPublicDeriverResponse,
} from '../../common/api/write';

export class AddCip1852Wrapper {
  static ownTables = Object.freeze({
    [Cip1852Tables.Cip1852WrapperSchema.name]: Cip1852Tables.Cip1852WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Cip1852WrapperInsert,
  ): Promise<$ReadOnly<Cip1852WrapperRow>> {
    return await addNewRowToTable<Cip1852WrapperInsert, Cip1852WrapperRow>(
      db, tx,
      request,
      AddCip1852Wrapper.ownTables[Cip1852Tables.Cip1852WrapperSchema.name].name,
    );
  }
}

export class AddCip1852ToPublicDeriver {
  static ownTables = Object.freeze({
    [Cip1852Tables.Cip1852ToPublicDeriverSchema.name]: Cip1852Tables.Cip1852ToPublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Cip1852ToPublicDeriverInsert,
  ): Promise<$ReadOnly<Cip1852ToPublicDeriverRow>> {
    return await addNewRowToTable<Cip1852ToPublicDeriverInsert, Cip1852ToPublicDeriverRow>(
      db, tx,
      request,
      AddCip1852ToPublicDeriver.ownTables[Cip1852Tables.Cip1852ToPublicDeriverSchema.name].name,
    );
  }
}

export class DeriveCip1852PublicFromPrivate {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetCip1852Wrapper,
    AddCip1852ToPublicDeriver,
    GetAllCip1852Wallets,
    DerivePublicDeriverFromKey,
    GetCip1852Tables,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    cip1852WrapperId: number,
    body: DerivePublicDeriverFromKeyRequest,
  ): Promise<AddPublicDeriverResponse<Row>> {
    const wrapper = await DeriveCip1852PublicFromPrivate.depTables.GetCip1852Wrapper.get(
      db, tx,
      cip1852WrapperId
    );
    if (wrapper == null) {
      throw new StaleStateError('DeriveCip1852PublicFromPrivate::add wrapper');
    }
    if (wrapper.PrivateDeriverLevel == null || wrapper.PrivateDeriverKeyDerivationId == null) {
      throw new StaleStateError('DeriveCip1852PublicFromPrivate::add no private deriver');
    }
    const privateDeriverLevel = wrapper.PrivateDeriverLevel;
    const privateDeriverKeyDerivationId = wrapper.PrivateDeriverKeyDerivationId;
    const cip1852Tables = DeriveCip1852PublicFromPrivate.depTables.GetCip1852Tables.get();
    return await DeriveCip1852PublicFromPrivate.depTables.DerivePublicDeriverFromKey.add<Row>(
      db, tx,
      body,
      privateDeriverKeyDerivationId,
      privateDeriverLevel,
      cip1852Tables,
      async (pubDeriver) => {
        // add new row in mapping table
        const children = await DeriveCip1852PublicFromPrivate
          .depTables
          .GetAllCip1852Wallets.forCip1852Wallet(
            db, tx,
            cip1852WrapperId
          );
        await DeriveCip1852PublicFromPrivate.depTables.AddCip1852ToPublicDeriver.add(
          db, tx,
          {
            Cip1852WrapperId: cip1852WrapperId,
            PublicDeriverId: pubDeriver.publicDeriverResult.PublicDeriverId,
            Index: children.length,
          }
        );
      }
    );
  }
}

export class AddCip1852AdhocPublicDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetCip1852Tables,
    AddCip1852ToPublicDeriver,
    GetAllCip1852Wallets,
    AddAdhocPublicDeriver,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddAdhocPublicDeriverRequest,
    cip1852WrapperId: number,
  ): Promise<AddAdhocPublicDeriverResponse<Row>> {
    const cip1852Tables = AddCip1852AdhocPublicDeriver.depTables.GetCip1852Tables.get();

    return await AddCip1852AdhocPublicDeriver.depTables.AddAdhocPublicDeriver.add<Row>(
      db, tx,
      request,
      cip1852Tables,
      async (pubDeriver) => {
        // add new row in mapping table
        const children = await AddCip1852AdhocPublicDeriver
          .depTables
          .GetAllCip1852Wallets
          .forCip1852Wallet(
            db, tx,
            cip1852WrapperId
          );
        await AddCip1852AdhocPublicDeriver.depTables.AddCip1852ToPublicDeriver.add(
          db, tx,
          {
            Cip1852WrapperId: cip1852WrapperId,
            PublicDeriverId: pubDeriver.publicDeriverResult.PublicDeriverId,
            Index: children.length,
          }
        );
      }
    );
  }
}
