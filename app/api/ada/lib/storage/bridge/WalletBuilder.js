// @flow

import type {
  lf$Transaction,
  lf$Database,
} from 'lovefield';

import type {
  ConceptualWalletRow, ConceptualWalletInsert
} from '../database/uncategorized/tables';
import {
  ConceptualWalletSchema,
} from '../database/uncategorized/tables';
import {
  addConceptualWallet
} from '../database/uncategorized/api';
import type {
  Bip44WrapperRow, Bip44WrapperInsert,
  PrivateDeriverRow,
} from '../database/genericBip44/tables';
import {
  Bip44WrapperSchema,
} from '../database/genericBip44/tables';
import {
  addBip44Wrapper,
} from '../database/genericBip44/api';

type PlainStateType = {
  db: lf$Database;
  tx: lf$Transaction;
  tables: Array<string>;
  buildSteps: Array<mixed => Promise<void>>;
};
type GenericStateType<Data> = Data;

class BuilderState<Data> {
  plain: PlainStateType;
  generic: GenericStateType<Data>;

  constructor(plain: PlainStateType, generic: GenericStateType<Data>) {
    this.plain = plain;
    this.generic = generic;
  }
}

function updateData<T, NewAddition>(
  oldBuilder: BuilderState<T>,
  addition: NewAddition,
): BuilderState<
  T & NewAddition
> {
  return new BuilderState<
    T & NewAddition
  >(
    oldBuilder.plain,
    {
      ...oldBuilder.generic,
      ...addition,
    },
  );
}

export class WalletBuilder {

  static start(db: lf$Database): BuilderState<$Shape<{||}>> {
    return new BuilderState(
      {
        db,
        tx: db.createTransaction(),
        tables: [],
        buildSteps: [],
      },
      {},
    );
  }

  static async commit<T>(builderState: BuilderState<T>): Promise<void> {
    // lock used tables
    const usedTables = builderState.plain.tables.map(
      name => builderState.plain.db.getSchema().table(name)
    );
    await builderState.plain.tx.begin(usedTables);

    // perform all insertions
    for (const step of builderState.plain.buildSteps) {
      await step();
    }

    // commit result
    await builderState.plain.tx.commit();
  }

  static addConceptualWallet<
    T: {}
  >(
    builderState: BuilderState<T>,
    insert: ConceptualWalletInsert,
  ): BuilderState<T & HasConceptualWallet> {
    const newBuilder = updateData<
      T,
      HasConceptualWallet,
    >(
      builderState,
      AsNotNull({ conceptualWalletRow: null }),
    );
    newBuilder.plain.tables.push(ConceptualWalletSchema.name);
    newBuilder.plain.buildSteps.push(async () => {
      newBuilder.generic.conceptualWalletRow = await addConceptualWallet({
        db: newBuilder.plain.db,
        tx: newBuilder.plain.tx,
        row: insert,
      });
    });
    return newBuilder;
  }

  static addBip44Wrapper<
    T: HasConceptualWallet
  >(
    builderState: BuilderState<T>,
    insert: T => Bip44WrapperInsert,
  ): BuilderState<T & HasBip44Wrapper> {
    const newBuilder = updateData(
      builderState,
      AsNotNull({ bip44WrapperRow: null }),
    );
    newBuilder.plain.tables.push(Bip44WrapperSchema.name);
    newBuilder.plain.buildSteps.push(async (finalData: T) => {
      newBuilder.generic.bip44WrapperRow = await addBip44Wrapper({
        db: newBuilder.plain.db,
        tx: newBuilder.plain.tx,
        row: insert(finalData)
      });
    });
    return newBuilder;
  }

  static addPrivateDeriver<
    T: HasBip44Wrapper
  >(
    builderState: BuilderState<T>
  ): BuilderState<T & HasPrivateDeriver> {
    return updateData(
      builderState,
      AsNotNull<HasPrivateDeriver>({ privateDeriver: null }),
    );
  }
}

/**
 * We need to insert null placeholder values into our builder during construction so that we can
 * properly typecheck which properties are available for the next construction step.
 * This data will be filled in once the transaction is called in `commit`
 *
 * When you chain builder steps, you don't want to have to null-check every step
 * since we know it will be filled once the lambda is called.
 * Therefore when we insert null values but coerce the type as if they are non-null and available.
 */
function AsNotNull<T: {}>(
  /** Assert argument is right type but with every field possibly null */
  data: $ObjMap<T, Nullable>
): T {
  // Note: return type is the non-null version if the argument
  return data;
}

type Nullable = <K>(K) => K | null;
// types to represent requirements
type HasConceptualWallet = { conceptualWalletRow: ConceptualWalletRow };
type HasBip44Wrapper = { bip44WrapperRow: Bip44WrapperRow };
type HasPrivateDeriver = { privateDeriver: PrivateDeriverRow };
