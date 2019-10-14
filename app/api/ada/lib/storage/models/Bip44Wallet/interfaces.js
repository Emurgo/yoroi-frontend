// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import type {
  KeyInfo,
} from '../utils';
import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/bip44/tables';
import {
  DerivePublicFromPrivate, AddAdhocPublicDeriver,
} from '../../database/bip44/api/write';
import {
  GetKeyForPrivateDeriver
} from '../../database/bip44/api/read';
import type {
  DerivePublicFromPrivateRequest as DbRequest,
  TreeInsert,
  AddAdhocPublicDeriverRequest, AddAdhocPublicDeriverResponse,
} from '../../database/bip44/api/write';
import type { AddPublicDeriverResponse } from '../../database/wallet/api/write';
import { UpdateGet, } from '../../database/primitives/api/write';

import type {
  KeyRow,
  KeyDerivationRow
} from '../../database/primitives/tables';

import type {
  IChangePasswordRequest, IChangePasswordRequestFunc,
} from '../common/interfaces';

type RawVariation<Func, Deps, Arg> = (
  tx: lf$Transaction,
  depTables: Deps,
  // should be able to extract Arg type with a $Call on Func
  // but for some reason it isn't working :/
  body: Arg,
) => ReturnType<Func>;

export interface IBip44Wallet {
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Bip44WrapperRow>,
    privateDeriverLevel: number | null,
    protocolMagic: number,
  ): IBip44Wallet;
  getDb(): lf$Database;
  getWrapperId(): number;
  getPublicDeriverLevel(): number;
  getSigningLevel(): number | null;
  getPrivateDeriverLevel(): number | null;
  getVersion(): number;
  getProtocolMagic(): number;
}

export type IDerivePublicFromPrivateRequest = {|
  ...DbRequest,
  decryptPrivateDeriverPassword: null | string,
  publicDeriverPublicKey?: KeyInfo,
  publicDeriverPrivateKey?: KeyInfo,
  initialDerivations: TreeInsert<any>,
|};
export type IDerivePublicFromPrivateResponse<Row> = AddPublicDeriverResponse<Row>;
export type IDerivePublicFromPrivateFunc<Row> = (
  body: IDerivePublicFromPrivateRequest
) => Promise<IDerivePublicFromPrivateResponse<Row>>;
export interface IDerivePublicFromPrivate {
  +rawDerivePublicDeriverFromPrivate: RawVariation<
    IDerivePublicFromPrivateFunc<mixed>,
    {|
      DerivePublicFromPrivate: Class<DerivePublicFromPrivate>,
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
      GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver>,
    |},
    IGetPrivateDeriverKeyRequest
  >;
  +getPrivateDeriverKey: IGetPrivateDeriverKeyFunc;

  +rawChangePrivateDeriverPassword: RawVariation<
    IChangePasswordRequestFunc,
    {|
      GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest
  >;
  +changePrivateDeriverPassword: IChangePasswordRequestFunc,
}

export type IAddAdhocPublicDeriverRequest = AddAdhocPublicDeriverRequest;
export type IAddAdhocPublicDeriverResponse<Row> = AddAdhocPublicDeriverResponse<Row>;
export type IAddAdhocPublicDeriverFunc<Row> = (
  body: IAddAdhocPublicDeriverRequest
) => Promise<IAddAdhocPublicDeriverResponse<Row>>;
export interface IAdhocPublicDeriver {
  +rawAddAdhocPubicDeriver: RawVariation<
    IAddAdhocPublicDeriverFunc<mixed>,
    {|
      AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver>,
    |},
    IAddAdhocPublicDeriverRequest,
  >;
  +addAdhocPubicDeriver: IAddAdhocPublicDeriverFunc<mixed>;
}
