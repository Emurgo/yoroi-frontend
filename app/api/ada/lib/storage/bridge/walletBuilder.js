// @flow

import type {
  lf$Transaction,
  lf$Database,
} from 'lovefield';

import type {
  ConceptualWalletInsert,
} from '../database/uncategorized/tables';
import {
  AddConceptualWallet,
} from '../database/uncategorized/api/add';
import type {
  Bip44WrapperInsert,
  PublicDeriverRow,
  KeyDerivationRow,
} from '../database/genericBip44/tables';
import {
  AddBip44Wrapper,
  AddPrivateDeriver,
  DerivePublicFromPrivate,
  DeriveTree,
} from '../database/genericBip44/api/add';
import type {
  PrivateDeriverRequest,
  TreeStart,
} from '../database/genericBip44/api/add';
import {
  getAllTables,
  raii,
} from '../database/utils';
import type {
  LovefieldDeriveRequest,
} from './lovefieldDerive';
import {
  derivePublicDeriver,
} from './lovefieldDerive';

/**
 * We need to statically ensure that
 * each step in the builder is only called once requirements are met.
 * Since Flow doesn't support constraints on the `this` variable,
 * we instead encode function in such a way that that
 * If the current state can be coerced into the requirements, the type is function
 * Otherwise, the type of the function is an uncallable type (resulting in an error)
 */
type StateConstraint<CurrentState, Requirement, Input, Output> = $Call<
  (Requirement => Input => WalletBuilder<Output>) // return callable function
  &
  () => {...}, // you can assign a function to {} but it cannot be called
  CurrentState
>

/**
 * Wrapper around a Lovefield tranasction
 * This is so we can capture the reference to the holder in a closure
 * but only populate the actual transaction once `commit` is called.
 */
type TxHolder = {
  tx: lf$Transaction,
};

/**
 * Allows to easily create a wallet with all the information you need in one transactional query
 * Ensuring proper call order and proper database access is managed for you
 */
export class WalletBuilder<CurrentState> {
  db: lf$Database;
  txHolder: TxHolder;

  /** keep track of all tables we need to lock to build this wallet */
  tables: Array<string>;

  /** keep track of all functions we need to call to build each part of this wallet */
  buildSteps: Array<CurrentState => Promise<void>>;

  /** Note the type of `state` is the type AFTER `commit` has been called */
  state: CurrentState;

  constructor(
    db: lf$Database,
    txHolder: TxHolder,
    tables: Array<string>,
    buildSteps: Array<CurrentState => Promise<void>>,
    state: CurrentState,
  ) {
    this.db = db;
    this.txHolder = txHolder;
    this.tables = tables;
    this.buildSteps = buildSteps;
    this.state = state;
  }

  updateData<Requirement: {}, NewAddition>(
    addition: NewAddition,
    newTables: Array<string>,
    newStep: (CurrentState & NewAddition & Requirement) => Promise<void>,
  ): WalletBuilder<
    CurrentState & NewAddition & Requirement
  > {
    return new WalletBuilder<
      CurrentState & NewAddition & Requirement
    >(
      this.db,
      this.txHolder,
      this.tables.concat(newTables),
      this.buildSteps.concat(newStep),
      {
        ...this.state,
        ...addition,
      },
    );
  }

  static start(db: lf$Database): WalletBuilder<$Shape<{||}>> {
    return new WalletBuilder(
      db,
      // only create the tx once commit is called
      AsNotNull<TxHolder>({ tx: null }),
      [],
      [],
      {},
    );
  }

  async commit(): Promise<CurrentState> {
    // lock used tables
    const usedTables = this.tables.map(
      name => this.db.getSchema().table(name)
    );

    await raii<void>(
      this.db,
      usedTables,
      async tx => {
        this.txHolder.tx = tx;
        // perform all steps to build wallet
        for (const step of this.buildSteps) {
          await step(this.state);
        }
      }
    );

    return this.state;
  }

  addConceptualWallet: StateConstraint<
    CurrentState,
    {},
    CurrentState => ConceptualWalletInsert,
    CurrentState & HasConceptualWallet,
  > = (
    insert: CurrentState => ConceptualWalletInsert,
  ) => {
    return this.updateData<{}, HasConceptualWallet>(
      AsNotNull<HasConceptualWallet>({ conceptualWalletRow: null }),
      Array.from(getAllTables(AddConceptualWallet)),
      async (finalData) => {
        finalData.conceptualWalletRow = await AddConceptualWallet.add(
          this.db,
          this.txHolder.tx,
          insert(finalData),
        );
      },
    );
  }

  addBip44Wrapper: StateConstraint<
    CurrentState,
    HasConceptualWallet,
    CurrentState => Bip44WrapperInsert,
    CurrentState & HasBip44Wrapper,
  > = (
    insert: CurrentState => Bip44WrapperInsert,
  ) => {
    return this.updateData<HasConceptualWallet, HasBip44Wrapper>(
      AsNotNull<HasBip44Wrapper>({ bip44WrapperRow: null }),
      Array.from(getAllTables(AddBip44Wrapper)),
      async (finalData) => {
        finalData.bip44WrapperRow = await AddBip44Wrapper.add(
          this.db,
          this.txHolder.tx,
          insert(finalData),
        );
      },
    );
  }

  addPrivateDeriver: StateConstraint<
    CurrentState,
    HasBip44Wrapper,
    CurrentState => PrivateDeriverRequest<mixed>,
    CurrentState & HasPrivateDeriver
  > = <Insert>(
    insert: CurrentState => PrivateDeriverRequest<Insert>,
  ) => {
    return this.updateData<HasBip44Wrapper, HasPrivateDeriver>(
      AsNotNull<HasPrivateDeriver>({ privateDeriver: null }),
      Array.from(getAllTables(AddPrivateDeriver)),
      async (finalData) => {
        finalData.privateDeriver = await AddPrivateDeriver.add(
          this.db,
          this.txHolder.tx,
          insert(finalData),
        );
      },
    );
  }

  derivePublicDeriver: StateConstraint<
    CurrentState,
    HasBip44Wrapper & HasPrivateDeriver,
    CurrentState => LovefieldDeriveRequest,
    CurrentState & HasPublicDeriver<mixed>
  > = (
    request: CurrentState => LovefieldDeriveRequest,
  ) => {
    return this.updateData<HasBip44Wrapper & HasPrivateDeriver, HasPublicDeriver<mixed>>(
      { publicDeriver: [] },
      Array.from(getAllTables(DerivePublicFromPrivate)),
      async (finalData) => {
        finalData.publicDeriver = [
          ...finalData.publicDeriver,
          await derivePublicDeriver(
            this.db,
            this.txHolder.tx,
            finalData.bip44WrapperRow.Bip44WrapperId,
            request(finalData),
          )
        ];
      },
    );
  }

  deriveFromPublic: StateConstraint<
    CurrentState,
    HasPublicDeriver<mixed>,
    CurrentState => {
      tree: TreeStart,
      level: number,
    },
    CurrentState
  > = (
    request: CurrentState => {
      tree: TreeStart,
      level: number,
    },
  ) => {
    return this.updateData<HasPublicDeriver<mixed>, {}>(
      {},
      Array.from(getAllTables(DeriveTree)),
      async (finalData) => {
        const { tree, level } = request(finalData);
        await DeriveTree.derive(
          this.db,
          this.txHolder.tx,
          tree,
          level,
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
  conceptualWalletRow: PromisslessReturnType<typeof AddConceptualWallet.add>
};
type HasBip44Wrapper = {
  bip44WrapperRow: PromisslessReturnType<typeof AddBip44Wrapper.add>
};
type HasPrivateDeriver = {
  privateDeriver: PromisslessReturnType<typeof AddPrivateDeriver.add>
};

type HasPublicDeriver<Row> = {
  // we have to re-specify the whole type since you can't use typeof on generic return types
  publicDeriver: Array<{
    publicDeriverResult: PublicDeriverRow,
    levelResult: {
      KeyDerivation: KeyDerivationRow,
      specificDerivationResult: Row
    }
  }>,
};
