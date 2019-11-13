// @flow

import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../../database/walletTypes/common/api/write';
import type {
  AddAdhocPublicDeriverRequest, AddAdhocPublicDeriverResponse,
} from '../../../database/walletTypes/common/api/write';
import type {
  TreeInsert,
} from '../../../database/walletTypes/common/utils';
import type { AddPublicDeriverResponse } from '../../../database/walletTypes/core/api/write';
import { UpdateGet, } from '../../../database/primitives/api/write';
import {
  GetKeyForDerivation,
} from '../../../database/primitives/api/read';

import type {
  KeyRow,
  KeyDerivationRow
} from '../../../database/primitives/tables';

import type {
  IChangePasswordRequest, IChangePasswordRequestFunc,
  RawVariation, RawTableVariation,
} from '../interfaces';

export interface IHasPrivateDeriver {
  getPrivateDeriverLevel(): number | null;
  getPrivateDeriverKeyDerivationId(): number | null;
}

export interface IHasLevels {
  getPublicDeriverLevel(): number;
  getDerivationTables(): Map<number, string>;
}

export interface IHasSign {
  getSigningLevel(): number | null;
}

export type IDerivePublicFromPrivateRequest = {|
  publicDeriverMeta: {|
    name: string,
  |},
  decryptPrivateDeriverPassword: null | string,
  /**
   * void -> do not store key
   * null -> store as unencrypted
   * string  -> store and encrypt
   */
  encryptPublicDeriverPassword?: null | string,
  initialDerivations: TreeInsert<any>,
  path: Array<number>,
|};
export type IDerivePublicFromPrivateResponse<Row> = AddPublicDeriverResponse<Row>;
export type IDerivePublicFromPrivateFunc<Row> = (
  body: IDerivePublicFromPrivateRequest
) => Promise<IDerivePublicFromPrivateResponse<Row>>;
export interface IDerivePublicFromPrivate {
  +rawDerivePublicDeriverFromPrivate: RawTableVariation<
    IDerivePublicFromPrivateFunc<mixed>,
    {|
      DerivePublicDeriverFromKey: Class<DerivePublicDeriverFromKey>,
    |},
    IDerivePublicFromPrivateRequest
  >;
  +derivePublicDeriverFromPrivate: IDerivePublicFromPrivateFunc<mixed>;
}

export type IGetPrivateDeriverKeyRequest = void;
export type IGetPrivateDeriverKeyResponse = {
  keyRow: $ReadOnly<KeyRow>,
  keyDerivation: $ReadOnly<KeyDerivationRow>,
};
export type IGetPrivateDeriverKeyFunc = (
  body: IGetPrivateDeriverKeyRequest
) => Promise<IGetPrivateDeriverKeyResponse>;
export interface IGetPrivateDeriverKey {
  +rawGetPrivateDeriverKey: RawVariation<
    IGetPrivateDeriverKeyFunc,
    {|
      GetKeyForDerivation: Class<GetKeyForDerivation>,
    |},
    IGetPrivateDeriverKeyRequest
  >;
  +getPrivateDeriverKey: IGetPrivateDeriverKeyFunc;

  +rawChangePrivateDeriverPassword: RawVariation<
    IChangePasswordRequestFunc,
    {|
      GetKeyForDerivation: Class<GetKeyForDerivation>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest
  >;
  +changePrivateDeriverPassword: IChangePasswordRequestFunc,
}

export type IAddAdhocPublicDeriverRequest<Insert> = AddAdhocPublicDeriverRequest<Insert>;
export type IAddAdhocPublicDeriverResponse<Row> = AddAdhocPublicDeriverResponse<Row>;
export type IAddAdhocPublicDeriverFunc<Insert, Row> = (
  body: IAddAdhocPublicDeriverRequest<Insert>
) => Promise<IAddAdhocPublicDeriverResponse<Row>>;
export interface IAdhocPublicDeriver {
  +rawAddAdhocPubicDeriver: RawTableVariation<
    IAddAdhocPublicDeriverFunc<mixed, mixed>,
    {|
      AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver>,
    |},
    IAddAdhocPublicDeriverRequest<mixed>,
  >;
  +addAdhocPubicDeriver: IAddAdhocPublicDeriverFunc<mixed, mixed>;
}
