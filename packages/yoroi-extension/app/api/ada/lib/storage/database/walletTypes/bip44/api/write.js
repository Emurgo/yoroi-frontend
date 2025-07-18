// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import type {
  Bip44ChainRow,
} from '../../common/tables';
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

import {
  Bip44DerivationLevels,
} from './utils';

export class ModifyDisplayCutoff {
  static ownTables: {|
    Bip44Chain: typeof Bip44ChainSchema,
    CanonicalAddress: typeof CanonicalAddressSchema,
    KeyDerivation: typeof KeyDerivationSchema,
  |} = Object.freeze({
    [Bip44ChainSchema.name]: Bip44ChainSchema,
    [CanonicalAddressSchema.name]: CanonicalAddressSchema,
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables: {|
    GetChildWithSpecific: typeof GetChildWithSpecific,
    GetDerivationSpecific: typeof GetDerivationSpecific,
    GetPathWithSpecific: typeof GetPathWithSpecific,
  |} = Object.freeze({
    GetPathWithSpecific,
    GetChildWithSpecific,
    GetDerivationSpecific,
  });

  static async pop(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      pubDeriverKeyDerivationId: number,
      derivationLevel: number,
      pathToLevel: Array<number>,
    |},
    derivationTables: Map<number, string>,
  ): Promise<void | {|
    index: number,
    row: $ReadOnly<CanonicalAddressRow>,
  |}> {
    const { derivationLevel, ...rest } = request;

    const oldChain = await (async () => {
      if (derivationLevel === Bip44DerivationLevels.CHAIN.level) {
        const result = await ModifyDisplayCutoff.depTables.GetDerivationSpecific.get<
          Bip44ChainRow
        >(
          db, tx,
          [request.pubDeriverKeyDerivationId],
          Bip44DerivationLevels.CHAIN.level,
          derivationTables,
        );
        const chainDerivation = result[0];
        if (chainDerivation === undefined) {
          // we know this level exists since we fetched it in GetChildIfExists
          throw new Error(`${nameof(ModifyDisplayCutoff)}::${nameof(ModifyDisplayCutoff.pop)} missing chain. Should never happen`);
        }
        return chainDerivation;
      }
      if (derivationLevel === Bip44DerivationLevels.ACCOUNT.level) {
        return (await ModifyDisplayCutoff.depTables.GetPathWithSpecific.getPath<Bip44ChainRow>(
          db, tx,
          {
            ...rest,
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
              throw new Error(`${nameof(ModifyDisplayCutoff)}::${nameof(ModifyDisplayCutoff.pop)} missing chain. Should never happen`);
            }
            return chainDerivation;
          },
        )).levelSpecific;
      }
      throw new Error(`${nameof(ModifyDisplayCutoff)}::${nameof(ModifyDisplayCutoff.pop)} incorrect pubderiver level`);
    })();

    if (oldChain.DisplayCutoff === null) {
      throw new Error(`${nameof(ModifyDisplayCutoff)}::${nameof(ModifyDisplayCutoff.pop)} should DisplayCutoff==null`);
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
          throw new Error(`${nameof(ModifyDisplayCutoff)}::${nameof(ModifyDisplayCutoff.pop)} missing address. Should never happen`);
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
