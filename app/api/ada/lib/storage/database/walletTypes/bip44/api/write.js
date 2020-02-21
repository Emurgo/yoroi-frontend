// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import { GetBip44Wrapper } from './read';
import type {
  Bip44WrapperInsert, Bip44WrapperRow,
} from '../tables';
import type {
  Bip44ChainRow,
} from '../../common/tables';
import * as Bip44Tables from '../tables';
import {
  Bip44ChainSchema,
} from '../../common/tables';
import {
  GetDerivationSpecific,
} from '../../common/api/read';
import type {
  CanonicalAddressRow,
} from '../../../primitives/tables';
import {
  KeyDerivationSchema,
  CanonicalAddressSchema,
} from '../../../primitives/tables';
import {
  GetChildWithSpecific, GetPathWithSpecific,
} from '../../../primitives/api/read';
import { RemoveKeyDerivationTree } from '../../../primitives/api/write';

import {
  Bip44DerivationLevels,
} from './utils';
import { addNewRowToTable, removeFromTableBatch, } from '../../../utils';

export class ModifyBip44Wrapper {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44WrapperSchema.name]: Bip44Tables.Bip44WrapperSchema,
  });
  static depTables = Object.freeze({
    GetBip44Wrapper,
    RemoveKeyDerivationTree,
  });

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44WrapperInsert,
  ): Promise<$ReadOnly<Bip44WrapperRow>> {
    return await addNewRowToTable<Bip44WrapperInsert, Bip44WrapperRow>(
      db, tx,
      request,
      ModifyBip44Wrapper.ownTables[Bip44Tables.Bip44WrapperSchema.name].name,
    );
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    id: number,
  ): Promise<void> {
    const fullRow = await ModifyBip44Wrapper.depTables.GetBip44Wrapper.get(
      db, tx,
      id
    );
    if (fullRow == null) {
      throw new Error(`${nameof(ModifyBip44Wrapper)}::${nameof(ModifyBip44Wrapper.remove)} Should never happen`);
    }

    // delete related key derivations
    // should cascade-delete the wrapper itself at the same time
    await ModifyBip44Wrapper.depTables.RemoveKeyDerivationTree.remove(
      db, tx,
      { rootKeyId: fullRow.RootKeyDerivationId },
    );
  }
}

export class ModifyDisplayCutoff {
  static ownTables = Object.freeze({
    [Bip44ChainSchema.name]: Bip44ChainSchema,
    [CanonicalAddressSchema.name]: CanonicalAddressSchema,
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetPathWithSpecific,
    GetChildWithSpecific,
    GetDerivationSpecific,
  });

  static async pop(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      pubDeriverKeyDerivationId: number,
      pathToLevel: Array<number>,
    |},
    derivationTables: Map<number, string>,
  ): Promise<void | {|
    index: number,
    row: $ReadOnly<CanonicalAddressRow>,
  |}> {
    const path = await ModifyDisplayCutoff.depTables.GetPathWithSpecific.getPath<Bip44ChainRow>(
      db, tx,
      {
        ...request,
        level: Bip44DerivationLevels.CHAIN.level,
      },
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetDerivationSpecific.get<
          Bip44ChainRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.CHAIN.level,
          derivationTables,
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

    const address = await ModifyDisplayCutoff.depTables.GetChildWithSpecific.get<
      CanonicalAddressRow
    >(
      db, tx,
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetDerivationSpecific.get<
          CanonicalAddressRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.ADDRESS.level,
          derivationTables,
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
    request: {|
      derivationId: number,
      newIndex: number,
    |},
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
