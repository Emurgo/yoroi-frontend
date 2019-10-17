// @flow

import {
  BigNumber
} from 'bignumber.js';

import type {
  KeyRow,
} from '../../database/primitives/tables';

export type Address = {|
  +address: string,
|};
export type Value = {|
  /**
   * note: an undefined value is different than a value of 0
   * since you can have a UTXO with a value of 0
   * which is different from having no UTXO at all
   */
  +value: void | BigNumber,
|};
export type Addressing = {|
  +addressing: {|
    +path: Array<number>,
    +startLevel: number,
  |}
|};

export type UsedStatus = {|
  isUsed: boolean,
|};

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

export type IGetBalanceRequest = void;
export type IGetBalanceResponse = BigNumber;
export type IGetBalanceFunc = (
  body: IGetBalanceRequest
) => Promise<IGetBalanceResponse>;
export interface IGetBalance {
  +getBalance: IGetBalanceFunc;
}
