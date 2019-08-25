// @flow

import type {
  lf$Transaction,
  lf$Database,
} from 'lovefield';

import type {
  ConceptualWalletInsert,
  KeyDerivationRow,
} from '../database/uncategorized/tables';
import {
  ModifyConceptualWallet,
} from '../database/uncategorized/api/write';
import type {
  Bip44WrapperInsert,
  PublicDeriverRow,
} from '../database/bip44/tables';
import {
  AddBip44Wrapper,
  AddPrivateDeriver,
  DerivePublicFromPrivate,
  AddAdhocPublicDeriver,
} from '../database/bip44/api/write';
import type {
  PrivateDeriverRequest, AddAdhocPublicDeriverRequest,
} from '../database/bip44/api/write';
import {
  getAllTables,
  raii,
} from '../database/utils';
import type {
  IDerivePublicFromPrivateRequest,
} from '../models/Bip44Wallet/interfaces';
import {
  derivePublicDeriver,
} from '../models/Bip44Wallet/index';

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
export class WalletBuilder<CurrentState: $Shape<{||}>> {
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
      Array.from(getAllTables(ModifyConceptualWallet)),
      async (finalData) => {
        finalData.conceptualWalletRow = await ModifyConceptualWallet.add(
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

  addAdhocPublicDeriver: StateConstraint<
    CurrentState,
    HasBip44Wrapper,
    CurrentState => AddAdhocPublicDeriverRequest,
    CurrentState & HasPublicDeriver<mixed>
  > = (
    request: CurrentState => AddAdhocPublicDeriverRequest,
  ) => {
    return this.updateData<HasBip44Wrapper, HasPublicDeriver<mixed>>(
      { publicDeriver: [] },
      Array.from(getAllTables(AddAdhocPublicDeriver)),
      async (finalData) => {
        finalData.publicDeriver = [
          ...finalData.publicDeriver,
          (await AddAdhocPublicDeriver.add(
            this.db,
            this.txHolder.tx,
            request(finalData),
          )).publicDeriver
        ];
      },
    );
  }

  derivePublicDeriver: StateConstraint<
    CurrentState,
    HasBip44Wrapper & HasPrivateDeriver,
    CurrentState => IDerivePublicFromPrivateRequest,
    CurrentState & HasPublicDeriver<mixed>
  > = (
    request: CurrentState => IDerivePublicFromPrivateRequest,
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
            { DerivePublicFromPrivate },
            finalData.bip44WrapperRow.Bip44WrapperId,
            finalData.bip44WrapperRow.Version,
            request(finalData),
          )
        ];
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
  data: WithNullableFields<T>
): T {
  // Note: return type is the non-null version if the argument
  return data;
}

// types to represent requirements
export type HasConceptualWallet = {
  conceptualWalletRow: PromisslessReturnType<typeof ModifyConceptualWallet.add>
};
export type HasBip44Wrapper = {
  bip44WrapperRow: PromisslessReturnType<typeof AddBip44Wrapper.add>
};
export type HasPrivateDeriver = {
  privateDeriver: PromisslessReturnType<typeof AddPrivateDeriver.add>
};

export type HasPublicDeriver<Row> = {
  // we have to re-specify the whole type since you can't use typeof on generic return types
  publicDeriver: Array<{
    publicDeriverResult: $ReadOnly<PublicDeriverRow>,
    levelResult: {
      KeyDerivation: $ReadOnly<KeyDerivationRow>,
      specificDerivationResult: $ReadOnly<Row>
    }
  }>,
};
