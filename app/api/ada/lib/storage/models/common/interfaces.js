// @flow

import type { lf$Transaction } from 'lovefield';

import type {
  KeyRow,
} from '../../database/primitives/tables';

export type RawVariation<Func, Deps, Arg> = (
  tx: lf$Transaction,
  deps: Deps,
  // should be able to extract Arg type with a $Call on Func
  // but for some reason it isn't working :/
  body: Arg,
) => ReturnType<Func>;

export type RawTableVariation<Func, Deps, Arg> = (
  tx: lf$Transaction,
  deps: Deps,
  // should be able to extract Arg type with a $Call on Func
  // but for some reason it isn't working :/
  body: Arg,
  tableMap: Map<number, string>,
) => ReturnType<Func>;

export type IChangePasswordRequest = {
  oldPassword: null | string,
  newPassword: null | string,
  currentTime: null | Date,
};
export type IChangePasswordResponse = $ReadOnly<KeyRow>;
export type IChangePasswordRequestFunc = (
  body: IChangePasswordRequest
) => Promise<IChangePasswordResponse>;

export type IRenameRequest = {
  newName: string,
};
export type IRenameResponse = void;
export type IRenameFunc = (
  body: IRenameRequest
) => Promise<IRenameResponse>;
export interface IRename {
  +rename: IRenameFunc;
}
