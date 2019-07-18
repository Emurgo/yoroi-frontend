// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  KeyInsert, KeyRow
} from '../uncategorized/tables';
import {
  KeySchema,
} from '../uncategorized/tables';
import {
  addKey,
} from '../uncategorized/api';

type BasicRequirement = {
  db: lf$Database,
  tx: lf$Transaction,
};

export class ILovefieldRequest<Requirement: BasicRequirement, ExecuteInput: {}, ExecuteOutput: {}> {
  // TODO: should be a set
  tablesToQuery: Array<string>;
  input: Requirement => Promise<ExecuteInput>;
  func: (Requirement & ExecuteInput) => Promise<ExecuteOutput>;

  async execute(req: Requirement): Promise<Requirement & ExecuteInput & ExecuteOutput> {
    // calculate the input for this step based on previous calculations
    // note: this will recursively call execute all previous states in our machine
    const pre = await this.input(req);
    // calculate new state based off prev calc + new input
    const result = await this.func({ ...req, ...pre });
    // pass full state forward to next step
    return {
      ...req,
      ...pre,
      ...result,
    };
  }

  tables(): Array<string> {
    return this.tablesToQuery;
  }

  /** Take in class itself where
   * Input is subset of curr class's Result
   *
   * merge the two table arrays
   * make excutor call itself then pass on the result
   * 
   * 
   * We need to chain this way instead of usinig callbacks
   * because we need to lock the db for all tables in the transaction
   * which means we have to know all steps before-hand
   */
  async chain<NextRequirement: BasicRequirement, NextInput: {}, NextOutput: {}>(
    clazz: Class<ILovefieldRequest<NextRequirement, NextInput, NextOutput>>,
    next: $Shape<Requirement & ExecuteInput & ExecuteOutput> => Promise<NextInput>,
  ): Promise<ILovefieldRequest<
      Requirement,
      NextInput & ExecuteInput & ExecuteOutput,
      NextOutput
    >> {
    const wrapper = new ILovefieldRequest<
      Requirement,
      NextInput & ExecuteInput & ExecuteOutput,
      NextOutput
    >();
    wrapper.input =
      async req => {
        const prevStep = await this.execute(req);
        const input = (prevStep: ExecuteInput);
        const output = (prevStep: ExecuteOutput);
        const nextInput = await next(prevStep);
        return { ...input, ...output, ...nextInput };
      };

    const nextRequest = new clazz();
    nextRequest.input = next;
    wrapper.func = nextRequest.func;

    // combine all tables together
    wrapper.tablesToQuery = [
      ...this.tablesToQuery,
      ...nextRequest.tablesToQuery,
    ];
    return wrapper;
  }

  async run(req: Requirement): Promise<Requirement & ExecuteInput & ExecuteOutput>  {
    req.tx.begin(
      this.tables().map(name => req.db.getSchema().table(name))
    );
    const result = await this.execute(req);
    await req.tx.commit();
    return result;
  }

  static start(req: BasicRequirement): ILovefieldRequest<
      BasicRequirement,
      {},
      BasicRequirement,
    > {
    const wrapper = new ILovefieldRequest<
      BasicRequirement,
      {},
      BasicRequirement,
    >();
    wrapper.input = () => Promise.resolve({});
    wrapper.tablesToQuery = [];
    wrapper.func = () => {
      return Promise.resolve(req);
    };
    return wrapper;
  }
}

export class AddKey extends ILovefieldRequest<
  {
    db: lf$Database,
    tx: lf$Transaction,
  },
  KeyInsert,
  KeyRow,
> {
  constructor() {
    super();
    this.tablesToQuery = [KeySchema.name];
    this.func = async insert => {
      return await addKey(
        insert.db, insert.tx,
        { row: insert }
      );
    };
  }
}
