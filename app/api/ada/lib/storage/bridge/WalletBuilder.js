// @flow

import type {
  lf$Transaction,
  lf$Database,
} from 'lovefield';

import type {
  ConceptualWalletRow, ConceptualWalletInsert,
} from '../database/uncategorized/tables';
import {
  KeySchema,
  ConceptualWalletSchema,
} from '../database/uncategorized/tables';
import {
  AddConceptualWallet,
} from '../database/uncategorized/api/add';
import type {
  Bip44WrapperRow, Bip44WrapperInsert,
  PrivateDeriverRow, PrivateDeriverInsert,
} from '../database/genericBip44/tables';
import {
  Bip44WrapperSchema,
  Bip44DerivationSchema,
  PrivateDeriverSchema,
  Bip44RootSchema,
} from '../database/genericBip44/tables';
import {
  AddBip44Wrapper,
  AddPrivateDeriver,
} from '../database/genericBip44/api/add';
import type {
  PrivateDeriverRequest
} from '../database/genericBip44/api/add';

class BuilderState<Data> {
  db: lf$Database;
  tx: lf$Transaction;
  tables: Array<string>;
  buildSteps: Array<Data => Promise<void>>;
  data: Data;

  constructor(
    db: lf$Database,
    tx: lf$Transaction,
    tables: Array<string>,
    buildSteps: Array<Data => Promise<void>>,
    data: Data,
  ) {
    this.db = db;
    this.tx = tx;
    this.tables = tables;
    this.buildSteps = buildSteps;
    this.data = data;
  }
}

function updateData<T, NewAddition>(
  oldBuilder: BuilderState<T>,
  addition: NewAddition,
  newTables: Array<string>,
  newStep: (T & NewAddition) => Promise<void>,
): BuilderState<
  T & NewAddition
> {
  return new BuilderState<
    T & NewAddition
  >(
    oldBuilder.db,
    oldBuilder.tx,
    oldBuilder.tables.concat(newTables),
    oldBuilder.buildSteps.concat(newStep),
    {
      ...oldBuilder.data,
      ...addition,
    },
  );
}

export class WalletBuilder {

  static start(db: lf$Database): BuilderState<$Shape<{||}>> {
    return new BuilderState(
      db,
      db.createTransaction(),
      [],
      [],
      {},
    );
  }

  static async commit<T>(builderState: BuilderState<T>): Promise<void> {
    // lock used tables
    const usedTables = builderState.tables.map(
      name => builderState.db.getSchema().table(name)
    );
    await builderState.tx.begin(usedTables);

    // perform all insertions
    for (const step of builderState.buildSteps) {
      await step(builderState.data);
    }

    // commit result
    await builderState.tx.commit();
  }

  static addConceptualWallet<
    T: {}
  >(
    builderState: BuilderState<T>,
    insert: T => ConceptualWalletInsert,
  ): BuilderState<T & HasConceptualWallet> {
    return updateData(
      builderState,
      AsNotNull<HasConceptualWallet>({ conceptualWalletRow: null }),
      [ConceptualWalletSchema.name],
      async (finalData) => {
        finalData.conceptualWalletRow = await AddConceptualWallet.func(
          builderState.db,
          builderState.tx,
          insert(finalData),
        );
      },
    );
  }

  static addBip44Wrapper<
    T: HasConceptualWallet
  >(
    builderState: BuilderState<T>,
    insert: T => Bip44WrapperInsert,
  ): BuilderState<T & HasBip44Wrapper> {
    return updateData(
      builderState,
      AsNotNull<HasBip44Wrapper>({ bip44WrapperRow: null }),
      [Bip44WrapperSchema.name],
      async (finalData) => {
        finalData.bip44WrapperRow = await AddBip44Wrapper.func(
          builderState.db,
          builderState.tx,
          insert(finalData),
        );
      },
    );
  }

  static addPrivateDeriver<
    T: HasBip44Wrapper,
    Insert,
  >(
    builderState: BuilderState<T>,
    insert: T => PrivateDeriverRequest<Insert>,
  ): BuilderState<T & HasPrivateDeriver> {
    return updateData(
      builderState,
      AsNotNull<HasPrivateDeriver>({ privateDeriver: null }),
      [
        PrivateDeriverSchema.name,
        KeySchema.name,
        Bip44DerivationSchema.name,
        Bip44RootSchema.name, // TODO: make more generic
      ],
      async (finalData) => {
        finalData.privateDeriver = await AddPrivateDeriver.func(
          builderState.db,
          builderState.tx,
          insert(finalData),
        );
      },
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
type HasConceptualWallet = {
  conceptualWalletRow: PromisslessReturnType<typeof AddConceptualWallet.func>
};
type HasBip44Wrapper = {
  bip44WrapperRow: PromisslessReturnType<typeof AddBip44Wrapper.func>
};
type HasPrivateDeriver = {
  privateDeriver: PromisslessReturnType<typeof AddPrivateDeriver.func>
};
