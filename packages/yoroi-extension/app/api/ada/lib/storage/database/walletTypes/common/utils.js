// @flow

import type { lf$Database, lf$Transaction } from 'lovefield';
import type {
  DerivationQueryResult,
} from '../../primitives/api/write';
import type {
  KeyInsert,
} from '../../primitives/tables';

export type InsertRequest = {|
  db: lf$Database,
  tx: lf$Transaction,
  lockedTables: Array<string>,
  keyDerivationId: number
|};

export type TreeInsertStart = {|
  derivationId: number,
  children: TreeInsert<any>,
|};

export type TreeInsert<T={ KeyDerivationId: number, ... }> = Array<{|
  index: number,
  insert: InsertRequest => Promise<T>,
  children?: TreeInsert<any>,
  address?: string,
  isUsed?: boolean,
|}>;

export type TreeResultStart<Row> = {|
  root: DerivationQueryResult<Row>,
  children: TreeResult<Row>,
|};

export type TreeResult<T={ KeyDerivationId: number, ... }> = Array<{|
  index: number,
  result: T,
  children?: TreeResult<any>,
|}>;

export type InsertPath<T={ KeyDerivationId: number, ... }> = Array<{|
  index: number,
  insert: InsertRequest => Promise<T>,
  privateKey: KeyInsert | null,
  publicKey: KeyInsert | null,
|}>;
