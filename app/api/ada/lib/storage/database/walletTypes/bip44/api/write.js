// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import type {
  Bip44WrapperInsert, Bip44WrapperRow,
  Bip44ToPublicDeriverInsert, Bip44ToPublicDeriverRow,
} from '../tables';
import type {
  Bip44ChainRow,
  Bip44AddressRow,
} from '../../common/tables';
import * as Bip44Tables from '../tables';
import {
  Bip44ChainSchema,
  Bip44AddressSchema,
} from '../../common/tables';
import {
  GetBip44DerivationSpecific,
  GetAllBip44Wallets,
  GetBip44Wrapper,
} from './read';

import type {
  KeyDerivationRow,
} from '../../../primitives/tables';
import { KeyDerivationSchema } from '../../../primitives/tables';
import {
  GetChildWithSpecific, GetPathWithSpecific,
} from '../../../primitives/api/read';

import {
  Bip44DerivationLevels,
  GetBip44Tables,
} from './utils';
import { addNewRowToTable, StaleStateError, } from '../../../utils';
import type {
  PublicDeriverRow,
} from '../../core/tables';
import { DerivePublicDeriverFromKey, AddAdhocPublicDeriver, } from '../../common/api/write';
import type {
  DerivePublicDeriverFromKeyRequest,
  AddAdhocPublicDeriverRequest,
  AddAdhocPublicDeriverResponse,
} from '../../common/api/write';

export class AddBip44Wrapper {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44WrapperSchema.name]: Bip44Tables.Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44WrapperInsert,
  ): Promise<$ReadOnly<Bip44WrapperRow>> {
    return await addNewRowToTable<Bip44WrapperInsert, Bip44WrapperRow>(
      db, tx,
      request,
      AddBip44Wrapper.ownTables[Bip44Tables.Bip44WrapperSchema.name].name,
    );
  }
}

export class AddBip44ToPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44ToPublicDeriverSchema.name]: Bip44Tables.Bip44ToPublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44ToPublicDeriverInsert,
  ): Promise<$ReadOnly<Bip44ToPublicDeriverRow>> {
    return await addNewRowToTable<Bip44ToPublicDeriverInsert, Bip44ToPublicDeriverRow>(
      db, tx,
      request,
      AddBip44ToPublicDeriver.ownTables[Bip44Tables.Bip44ToPublicDeriverSchema.name].name,
    );
  }
}

export class DeriveBip44PublicFromPrivate {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetBip44Wrapper,
    AddBip44ToPublicDeriver,
    GetAllBip44Wallets,
    DerivePublicDeriverFromKey,
    GetBip44Tables,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    bip44WrapperId: number,
    body: DerivePublicDeriverFromKeyRequest,
  ): Promise<{
    publicDeriverResult: $ReadOnly<PublicDeriverRow>,
    levelResult: {
      KeyDerivation: $ReadOnly<KeyDerivationRow>,
      specificDerivationResult: $ReadOnly<Row>
    },
  }> {
    const wrapper = await DeriveBip44PublicFromPrivate.depTables.GetBip44Wrapper.get(
      db, tx,
      bip44WrapperId
    );
    if (wrapper == null) {
      throw new StaleStateError('DeriveBip44PublicFromPrivate::add wrapper');
    }
    if (wrapper.PrivateDeriverLevel == null || wrapper.PrivateDeriverKeyDerivationId == null) {
      throw new StaleStateError('DeriveBip44PublicFromPrivate::add no private deriver');
    }
    const privateDeriverLevel = wrapper.PrivateDeriverLevel;
    const privateDeriverKeyDerivationId = wrapper.PrivateDeriverKeyDerivationId;
    const bip44Tables = DeriveBip44PublicFromPrivate.depTables.GetBip44Tables.get();
    return await DeriveBip44PublicFromPrivate.depTables.DerivePublicDeriverFromKey.add<Row>(
      db, tx,
      body,
      privateDeriverKeyDerivationId,
      privateDeriverLevel,
      bip44Tables,
      async (pubDeriver) => {
        // add new row in mapping table
        const children = await DeriveBip44PublicFromPrivate
          .depTables
          .GetAllBip44Wallets.forBip44Wallet(
            db, tx,
            bip44WrapperId
          );
        await DeriveBip44PublicFromPrivate.depTables.AddBip44ToPublicDeriver.add(
          db, tx,
          {
            Bip44WrapperId: bip44WrapperId,
            PublicDeriverId: pubDeriver.publicDeriverResult.PublicDeriverId,
            Index: children.length,
          }
        );
      }
    );
  }
}

export class ModifyDisplayCutoff {
  static ownTables = Object.freeze({
    [Bip44ChainSchema.name]: Bip44ChainSchema,
    [Bip44AddressSchema.name]: Bip44AddressSchema,
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetPathWithSpecific,
    GetChildWithSpecific,
    GetBip44DerivationSpecific,
  });

  static async pop(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      pubDeriverKeyDerivationId: number,
      pathToLevel: Array<number>,
    },
  ): Promise<void | {
    index: number,
    row: $ReadOnly<Bip44AddressRow>,
  }> {
    const path = await ModifyDisplayCutoff.depTables.GetPathWithSpecific.getPath<Bip44ChainRow>(
      db, tx,
      {
        ...request,
        level: Bip44DerivationLevels.CHAIN.level,
      },
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetBip44DerivationSpecific.get<
        Bip44ChainRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.CHAIN.level,
        );
        const chainDerivation = result[0];
        if (chainDerivation === undefined) {
          // we know this level exists since we fetched it in GetChildIfExists
          throw new Error('ModifyDisplayCutoff::get missing chain. Should never happen');
        }
        return chainDerivation;
      },
    );
    const oldChain = path.levelSpecific;

    if (oldChain.DisplayCutoff === null) {
      throw new Error('DisplayCutoffRequest::pop should DisplayCutoff==null');
    }

    const newIndex = oldChain.DisplayCutoff + 1;

    // Get the address at this new index

    const address = await ModifyDisplayCutoff.depTables.GetChildWithSpecific.get<Bip44AddressRow>(
      db, tx,
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetBip44DerivationSpecific.get<
          Bip44AddressRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.ADDRESS.level,
        );
        const addressDerivation = result[0];
        if (addressDerivation === undefined) {
          // we know this level exists since we fetched it in GetChildIfExists
          throw new Error('ModifyDisplayCutoff::get missing address. Should never happen');
        }
        return addressDerivation;
      },
      oldChain.KeyDerivationId,
      newIndex,
    );

    // note: if the address doesn't exist, return right away
    // do NOT save to storage
    if (address === undefined) {
      return undefined;
    }

    // Update the external chain DisplayCutoff


    await ModifyDisplayCutoff.set(
      db, tx,
      {
        derivationId: oldChain.KeyDerivationId,
        newIndex
      },
    );

    return {
      index: newIndex,
      row: address.levelSpecific,
    };
  }

  static async set(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      derivationId: number,
      newIndex: number,
    },
  ): Promise<void> {
    const chainTable = db.getSchema().table(
      ModifyDisplayCutoff.ownTables[Bip44ChainSchema.name].name
    );
    const updateQuery = db
      .update(chainTable)
      .set(
        chainTable[Bip44ChainSchema.properties.DisplayCutoff],
        request.newIndex
      )
      .where(op.and(
        chainTable[Bip44ChainSchema.properties.KeyDerivationId].eq(
          request.derivationId
        ),
      ));

    await tx.attach(updateQuery);
  }
}

export class AddBip44AdhocPublicDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetBip44Tables,
    AddBip44ToPublicDeriver,
    GetAllBip44Wallets,
    AddAdhocPublicDeriver,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddAdhocPublicDeriverRequest,
    bip44WrapperId: number,
  ): Promise<AddAdhocPublicDeriverResponse<Row>> {
    const bip44Tables = AddBip44AdhocPublicDeriver.depTables.GetBip44Tables.get();

    return await AddBip44AdhocPublicDeriver.depTables.AddAdhocPublicDeriver.add<Row>(
      db, tx,
      request,
      bip44Tables,
      async (pubDeriver) => {
        // add new row in mapping table
        const children = await AddBip44AdhocPublicDeriver
          .depTables
          .GetAllBip44Wallets
          .forBip44Wallet(
            db, tx,
            bip44WrapperId
          );
        await AddBip44AdhocPublicDeriver.depTables.AddBip44ToPublicDeriver.add(
          db, tx,
          {
            Bip44WrapperId: bip44WrapperId,
            PublicDeriverId: pubDeriver.publicDeriverResult.PublicDeriverId,
            Index: children.length,
          }
        );
      }
    );
  }
}
