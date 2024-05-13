// @flow

import type {
  lf$Transaction,
  lf$Database,
} from 'lovefield';

import type {
  ConceptualWalletInsert,
} from '../../database/walletTypes/core/tables';
import {
  ModifyConceptualWallet,
} from '../../database/walletTypes/core/api/write';
import type {
  Bip44WrapperInsert,
} from '../../database/walletTypes/bip44/tables';
import type {
  Cip1852WrapperInsert,
} from '../../database/walletTypes/cip1852/tables';
import {
  ModifyBip44Wrapper,
} from '../../database/walletTypes/bip44/api/write';
import {
  ModifyCip1852Wrapper,
} from '../../database/walletTypes/cip1852/api/write';
import type {
  AddAdhocPublicDeriverRequest,
} from '../../database/walletTypes/common/api/write';
import {
  AddAdhocPublicDeriver,
  AddDerivationTree,
  DerivePublicDeriverFromKey,
} from '../../database/walletTypes/common/api/write';
import type { AddPublicDeriverResponse } from '../../database/walletTypes/core/api/write';
import {
  getAllTables,
  raii,
} from '../../database/utils';
import type {
  IDerivePublicFromPrivateRequest,
} from '../../models/ConceptualWallet/interfaces';
import {
  derivePublicDeriver,
} from '../../models/ConceptualWallet/traits';
import type { AddDerivationRequest } from '../../database/primitives/api/write';
import type { TreeInsertStart } from '../../database/walletTypes/common/utils.types';

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
type TxHolder = {| tx: lf$Transaction, |};

/**
 * Allows to easily create a wallet with all the information you need in one transactional query
 * Ensuring proper call order and proper database access is managed for you
 */
export class WalletBuilder<CurrentState: {...}> {
  db: lf$Database;
  txHolder: TxHolder;

  /** keep track of all tables we need to lock to build this wallet */
  tables: Array<string>;
  derivationTables: Map<number, string>;

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
    derivationTables: Map<number, string>,
  ) {
    this.db = db;
    this.txHolder = txHolder;
    this.tables = tables;
    this.buildSteps = buildSteps;
    this.state = state;
    this.derivationTables = derivationTables;
  }

  updateData<Requirement: {...}, NewAddition>(
    addition: NewAddition,
    newTables: Array<string>,
    newStep: (CurrentState & NewAddition & Requirement) => Promise<void>,
  ): WalletBuilder<
    CurrentState & NewAddition & Requirement
  > {
    // we know this type holds due to StateConstraint before this function is called
    const state: CurrentState & Requirement = (this.state: any);

    return new WalletBuilder<
      CurrentState & NewAddition & Requirement
    >(
      this.db,
      this.txHolder,
      this.tables.concat(newTables),
      this.buildSteps.concat(newStep),
      ({
        ...addition,
        ...state,
      }: any),
      this.derivationTables,
    );
  }

  static start(
    db: lf$Database,
    derivationTables: Map<number, string>,
  ): WalletBuilder<$Shape<{||}>> {
    return new WalletBuilder(
      db,
      // only create the tx once commit is called
      AsNotNull<TxHolder>({ tx: null }),
      [],
      [],
      {},
      derivationTables,
    );
  }

  async commit(): Promise<CurrentState> {
    // lock used tables
    const allTables = Array.from([
      ...this.tables,
      ...Array.from(this.derivationTables.values()),
    ]);
    const usedTables = allTables.map(
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
    {...},
    CurrentState => ConceptualWalletInsert,
    CurrentState & HasConceptualWallet,
  > = (
    insert: CurrentState => ConceptualWalletInsert,
  ) => {
    return this.updateData<{...}, HasConceptualWallet>(
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
      Array.from(getAllTables(ModifyBip44Wrapper)),
      async (finalData) => {
        finalData.bip44WrapperRow = await ModifyBip44Wrapper.add(
          this.db,
          this.txHolder.tx,
          insert(finalData),
        );
      },
    );
  }

  addCip1852Wrapper: StateConstraint<
    CurrentState,
    HasConceptualWallet,
    CurrentState => Cip1852WrapperInsert,
    CurrentState & HasCip1852Wrapper,
  > = (
    insert: CurrentState => Cip1852WrapperInsert,
  ) => {
    return this.updateData<HasConceptualWallet, HasCip1852Wrapper>(
      AsNotNull<HasCip1852Wrapper>({ cip1852WrapperRow: null }),
      Array.from(getAllTables(ModifyCip1852Wrapper)),
      async (finalData) => {
        finalData.cip1852WrapperRow = await ModifyCip1852Wrapper.add(
          this.db,
          this.txHolder.tx,
          insert(finalData),
        );
      },
    );
  }

  addFromRoot: StateConstraint<
    CurrentState,
    HasConceptualWallet,
    CurrentState => {|
      rootInsert: AddDerivationRequest<any>,
      tree: number => TreeInsertStart,
    |},
    CurrentState & HasRoot
  > = <Insert>(
    insert: CurrentState => {|
      rootInsert: AddDerivationRequest<Insert>,
      tree: number => TreeInsertStart,
    |},
  ) => {
    return this.updateData<HasConceptualWallet, HasRoot>(
      AsNotNull<HasRoot>({ root: null }),
      Array.from(getAllTables(AddDerivationTree)),
      async (finalData) => {
        const { rootInsert, tree } = insert(finalData);
        finalData.root = await AddDerivationTree.includingParent<Insert, *>(
          this.db,
          this.txHolder.tx,
          rootInsert,
          this.derivationTables,
          0, // root
          tree,
        );
      },
    );
  }

  addAdhocPublicDeriver: StateConstraint<
    CurrentState,
    HasConceptualWallet,
    CurrentState => AddAdhocPublicDeriverRequest<any>,
    CurrentState & HasPublicDeriver<mixed>
  > = <Insert>(
    request: CurrentState => AddAdhocPublicDeriverRequest<Insert>,
  ) => {
    return this.updateData<HasConceptualWallet, HasPublicDeriver<mixed>>(
      { publicDeriver: [] },
      Array.from(getAllTables(AddAdhocPublicDeriver)),
      async (finalData) => {
        finalData.publicDeriver = [
          ...finalData.publicDeriver,
          (await AddAdhocPublicDeriver.add(
            this.db,
            this.txHolder.tx,
            request(finalData),
            finalData.conceptualWalletRow.ConceptualWalletId,
            this.derivationTables,
          )).publicDeriver
        ];
      },
    );
  }

  derivePublicDeriver: StateConstraint<
    CurrentState,
    HasConceptualWallet,
    CurrentState => {|
      deriverRequest: IDerivePublicFromPrivateRequest,
      privateDeriverKeyDerivationId: number,
      privateDeriverLevel: number,
    |},
    CurrentState & HasPublicDeriver<mixed>
  > = (
    request: CurrentState => {|
      deriverRequest: IDerivePublicFromPrivateRequest,
      privateDeriverKeyDerivationId: number,
      privateDeriverLevel: number,
    |},
  ) => {
    return this.updateData<HasConceptualWallet, HasPublicDeriver<mixed>>(
      { publicDeriver: [] },
      Array.from(getAllTables(DerivePublicDeriverFromKey)),
      async (finalData) => {
        const {
          privateDeriverKeyDerivationId,
          privateDeriverLevel,
          deriverRequest,
        } = request(finalData);
        finalData.publicDeriver = [
          ...finalData.publicDeriver,
          await derivePublicDeriver(
            this.db,
            this.txHolder.tx,
            { DerivePublicDeriverFromKey },
            finalData.conceptualWalletRow.ConceptualWalletId,
            deriverRequest,
            privateDeriverKeyDerivationId,
            privateDeriverLevel,
            this.derivationTables
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
function AsNotNull<T: {...}>(
  /** Assert argument is right type but with every field possibly null */
  data: WithNullableFields<T>
): T {
  // Note: return type is the non-null version if the argument
  return (data: any);
}

// types to represent requirements
export type HasConceptualWallet = {|
  conceptualWalletRow: PromisslessReturnType<typeof ModifyConceptualWallet.add>
|};
export type HasBip44Wrapper = {|
  bip44WrapperRow: PromisslessReturnType<typeof ModifyBip44Wrapper.add>
|};
export type HasCip1852Wrapper = {|
  cip1852WrapperRow: PromisslessReturnType<typeof ModifyCip1852Wrapper.add>
|};
export type HasRoot = {|
  root: PromisslessReturnType<typeof AddDerivationTree.includingParent>
|};

export type HasPublicDeriver<Row> = {|
  // we have to re-specify the whole type since you can't use typeof on generic return types
  publicDeriver: Array<AddPublicDeriverResponse<Row>>,
|};
