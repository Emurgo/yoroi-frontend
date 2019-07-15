// @flow

import type {
  lf$Transaction,
  lf$Database,
  lf$schema$Table,
} from 'lovefield';

import type { ConceptualWalletRow } from '../database/uncategorized/tables';
import type { PrivateDeriverRow } from '../database/genericBip44/tables';

type PlainStateType = {
  db: lf$Database;
  tx: lf$Transaction;
  tables: Array<lf$schema$Table>;
};
type GenericStateType<Data> ={
  data: Data;
};

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
      ...oldBuilder.generic.data,
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
      },
      {},
    );
  }

  static async commit<T>(builderState: BuilderState<T>): Promise<void> {
    await builderState.plain.tx.commit();
  }

  static addConceptual<
    T: {}
  >(
    builderState: BuilderState<T>
  ): BuilderState<T & { asdf: null | number }> {
    return updateData(
      builderState,
      { asdf: 5 },
    );
  }

  static addAsdf<
    T: { asdf: null | number }
  >(
    builderState: BuilderState<T>
  ): BuilderState<T & { zxcv: number}> {
    return updateData(
      builderState,
      { zxcv: 5 },
    );
  }

  static addZxcv<T>(
    builder: { asdf: number, zxcv: number } & T
  ): T & { qwer: number} {
    return {
      ...{ qwer: builder.asdf },
      ...builder,
    };
  }
}
