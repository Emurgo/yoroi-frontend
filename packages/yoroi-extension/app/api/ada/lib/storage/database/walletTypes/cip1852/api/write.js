// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import { GetCip1852Wrapper } from './read';
import type {
  Cip1852WrapperInsert, Cip1852WrapperRow,
} from '../tables';
import * as Cip1852Tables from '../tables';
import { RemoveKeyDerivationTree } from '../../../primitives/api/write';

import { addNewRowToTable, } from '../../../utils';

export class ModifyCip1852Wrapper {
  static ownTables: {|
    Cip1852Wrapper: typeof Cip1852Tables.Cip1852WrapperSchema,
  |} = Object.freeze({
    [Cip1852Tables.Cip1852WrapperSchema.name]: Cip1852Tables.Cip1852WrapperSchema,
  });
  static depTables: {|
    GetCip1852Wrapper: typeof GetCip1852Wrapper,
    RemoveKeyDerivationTree: typeof RemoveKeyDerivationTree,
  |} = Object.freeze({
    GetCip1852Wrapper,
    RemoveKeyDerivationTree,
  });

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Cip1852WrapperInsert,
  ): Promise<$ReadOnly<Cip1852WrapperRow>> {
    return await addNewRowToTable<Cip1852WrapperInsert, Cip1852WrapperRow>(
      db, tx,
      request,
      ModifyCip1852Wrapper.ownTables[Cip1852Tables.Cip1852WrapperSchema.name].name,
    );
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    id: number,
  ): Promise<void> {
    const fullRow = await ModifyCip1852Wrapper.depTables.GetCip1852Wrapper.get(
      db, tx,
      id
    );
    if (fullRow == null) {
      throw new Error(`${nameof(ModifyCip1852Wrapper)}::${nameof(ModifyCip1852Wrapper.remove)} Should never happen`);
    }

    // delete related key derivations
    // should cascade-delete the wrapper itself at the same time
    await ModifyCip1852Wrapper.depTables.RemoveKeyDerivationTree.remove(
      db, tx,
      { rootKeyId: fullRow.RootKeyDerivationId },
    );
  }
}
