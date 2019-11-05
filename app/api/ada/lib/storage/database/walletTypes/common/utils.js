// @flow

import type {
  DerivationQueryResult,
} from '../../primitives/api/write';
import type {
  KeyInsert,
} from '../../primitives/tables';

export type TreeInsertStart = {|
  derivationId: number,
  children: TreeInsert<any>,
|};

export type TreeInsert<T={}> = Array<{|
  index: number,
  insert: T,
  children?: TreeInsert<any>,
|}>;

export type TreeResultStart<Row> = {|
  root: DerivationQueryResult<Row>,
  children: TreeResult<Row>,
|};

export type TreeResult<T={}> = Array<{|
  index: number,
  result: {|
    KeyDerivationId: number,
    ...T,
  |},
  children?: TreeResult<any>,
|}>;

export type InsertPath = Array<{|
  index: number,
  insert: {},
  privateKey: KeyInsert | null,
  publicKey: KeyInsert | null,
|}>;
